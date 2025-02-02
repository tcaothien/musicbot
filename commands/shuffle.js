const { EmbedBuilder } = require('discord.js');
const config = require("../config.js");
const musicIcons = require('../UI/icons/musicicons.js');

async function shuffle(client, interaction, lang) {
    try {
        const player = client.riffy.players.get(interaction.guildId);

        if (!player || !player.queue || player.queue.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setAuthor({
                    name: "Danh sách phát trống",
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setDescription("Không có bài hát nào trong danh sách phát để xáo trộn!")
                .setFooter({ text: "Cảm ơn bạn đã sử dụng bot!", iconURL: musicIcons.heartIcon });

            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        // Xáo trộn danh sách phát
        for (let i = player.queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [player.queue[i], player.queue[j]] = [player.queue[j], player.queue[i]];
        }

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setAuthor({
                name: "Đã xáo trộn danh sách phát",
                iconURL: musicIcons.beats2Icon,
                url: config.SupportServer
            })
            .setDescription("Danh sách phát đã được xáo trộn thành công!")
            .setFooter({ text: "Cảm ơn bạn đã sử dụng bot!", iconURL: musicIcons.heartIcon });

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Lỗi khi thực hiện lệnh xáo trộn:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({
                name: "Lỗi",
                iconURL: musicIcons.alertIcon,
                url: config.SupportServer
            })
            .setFooter({ text: "Cảm ơn bạn đã sử dụng bot!", iconURL: musicIcons.heartIcon })
            .setDescription("Đã xảy ra lỗi khi xáo trộn danh sách phát. Vui lòng thử lại sau!");

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

module.exports = {
    name: "shuffle",
    description: "Xáo trộn danh sách phát hiện tại",
    permissions: "0x0000000000000800",
    options: [],
    run: shuffle
};
