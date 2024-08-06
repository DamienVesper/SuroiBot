import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    User,
    type ButtonInteraction,
    type EmbedBuilder,
    type InteractionCollector,
    type Message
} from 'discord.js';

import type { DiscordBot } from './DiscordBot.js';

const COLLECTOR_TIMEOUT = 3e4;

export class Paginator {
    client: DiscordBot;

    interaction: ChatInputCommandInteraction;
    user: User;
    pages: EmbedBuilder[];

    actionRow: ActionRowBuilder<ButtonBuilder> | undefined = undefined;
    collector: InteractionCollector<ButtonInteraction> | undefined = undefined;

    currentPage = 0;

    /**
     * Create a new paginator.
     * @param client The interacting client.
     * @param interaction The invoking interaction.
     * @param user The user who invoked the interaction.
     * @param pages The number of pages the paginator should have. Leave blank for automatic.
     */
    constructor (client: DiscordBot, interaction: ChatInputCommandInteraction, user: User, pages: EmbedBuilder[]) {
        this.client = client;

        this.interaction = interaction;
        this.user = user;
        this.pages = pages;

        void this.setup();
    }

    /**
     * Setup the paginator.
     */
    setup = async (): Promise<Message> => {
        const FIRST = this.createButton(`pageFirst`, `⏮`, ButtonStyle.Secondary, true);
        const PREV = this.createButton(`pagePrev`, `◀️`, ButtonStyle.Secondary, true);
        const COUNT = this.createButton(`pageCount`, `${this.currentPage + 1} / ${this.pages.length}`, ButtonStyle.Secondary, true);
        const NEXT = this.createButton(`pageNext`, `▶️`, ButtonStyle.Secondary);
        const LAST = this.createButton(`pageLast`, `⏭`, ButtonStyle.Secondary);

        this.actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents([FIRST, PREV, COUNT, NEXT, LAST]);
        const message = this.interaction.replied || this.interaction.deferred
            ? await this.interaction.followUp({ embeds: [this.pages[this.currentPage]], components: [this.actionRow], fetchReply: true })
            : await this.interaction.reply({ embeds: [this.pages[this.currentPage]], components: [this.actionRow], fetchReply: true });

        this.collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: COLLECTOR_TIMEOUT });
        this.collector.on(`collect`, interaction => {
            if (interaction.user.id !== this.user.id) return;
            switch (interaction.customId) {
                case `pageFirst`:
                    this.currentPage = 0;
                    break;
                case `pagePrev`:
                    this.currentPage--;
                    this.currentPage = Math.max(0, this.currentPage);
                    break;
                case `pageNext`:
                    this.currentPage++;
                    this.currentPage = Math.min(this.pages.length - 1, this.currentPage);
                    break;
                case `pageLast`:
                    this.currentPage = this.pages.length - 1;
                    break;
            }

            FIRST.setDisabled(this.currentPage === 0);
            PREV.setDisabled(this.currentPage === 0);
            NEXT.setDisabled(this.currentPage === this.pages.length - 1);
            LAST.setDisabled(this.currentPage === this.pages.length - 1);

            COUNT.setLabel(`${this.currentPage + 1} / ${this.pages.length}`);
            void interaction.update({ embeds: [this.pages[this.currentPage]], components: [this.actionRow!] }).catch(() => {
                this.client.logger.warn(`Gateway`, `Failed to update paginator: Message was deleted.`);
            });

            this.collector!.resetTimer();
        });

        this.collector.on(`end`, () => {
            void this.interaction.editReply({ embeds: [this.pages[this.currentPage]], components: [] }).catch(() => {
                this.client.logger.warn(`Gateway`, `Failed to update paginator: Message was deleted.`);
            });
        });

        return message;
    };

    /**
     * Create a button.
     * @param customId The custom ID for the button.
     * @param label The button label.
     * @param style The button style.
     * @param disabled Whether the button should be disabled or enabled.
     */
    createButton = (customId: string, label: string, style: ButtonStyle, disabled?: boolean): ButtonBuilder => new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style).setDisabled(disabled);
};
