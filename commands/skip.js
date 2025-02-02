const { EmbedBuilder } = require('discord.js');
const config = require("../config.js");
const musicIcons = require('../UI/icons/musicicons.js');

async function skip(client, interaction, lang) {
    try {
        const player = client.riffy.players.get(interaction.guildId);

        if (!player) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ 
                    name: "Không có trình phát nhạc đang hoạt động", 
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setFooter({ text: "Cảm ơn bạn đã sử dụng bot!", iconURL: musicIcons.heartIcon })
                .setDescription("Hiện không có bài hát nào đang phát để bỏ qua!");

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        player.stop();

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setAuthor({ 
                name: "Đã bỏ qua bài hát", 
                iconURL: musicIcons.skipIcon,
                url: config.SupportServer
            })
            .setFooter({ text: "Cảm ơn bạn đã sử dụng bot!", iconURL: musicIcons.heartIcon })
            .setDescription("Bài hát hiện tại đã được bỏ qua!");

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Lỗi khi thực hiện lệnh bỏ qua:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ 
                name: "Lỗi", 
                iconURL: musicIcons.alertIcon,
                url: config.SupportServer
            })
            .setFooter({ text: "Cảm ơn bạn đã sử dụng bot!", iconURL: musicIcons.heartIcon })
            .setDescription("Đã xảy ra lỗi khi bỏ qua bài hát. Vui lòng thử lại sau!");

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

module.exports = {
    name: "skip",
    description: "Bỏ qua bài hát hiện tại",
    permissions: "0x0000000000000800",
    options: [],
    run: skip
};
