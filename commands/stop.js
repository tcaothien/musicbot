const { EmbedBuilder } = require('discord.js');
const config = require("../config.js");
const musicIcons = require('../UI/icons/musicicons.js');

async function stop(client, interaction, lang) {
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
                .setDescription("Hiện không có bài hát nào đang phát để dừng!");

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        player.stop();
        player.destroy();

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setAuthor({ 
                name: "Đã dừng phát nhạc", 
                iconURL: musicIcons.stopIcon,
                url: config.SupportServer
            })
            .setFooter({ text: "Cảm ơn bạn đã sử dụng bot!", iconURL: musicIcons.heartIcon })
            .setDescription("Nhạc đã được dừng và trình phát đã bị hủy!");

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Lỗi khi thực hiện lệnh dừng phát nhạc:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ 
                name: "Lỗi", 
                iconURL: musicIcons.alertIcon,
                url: config.SupportServer
            })
            .setFooter({ text: "Cảm ơn bạn đã sử dụng bot!", iconURL: musicIcons.heartIcon })
            .setDescription("Đã xảy ra lỗi khi dừng phát nhạc. Vui lòng thử lại sau!");

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

module.exports = {
    name: "stop",
    description: "Dừng bài hát hiện tại và hủy trình phát",
    permissions: "0x0000000000000800",
    options: [],
    run: stop
};
