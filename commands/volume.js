const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const config = require("../config.js");
const musicIcons = require('../UI/icons/musicicons.js');

async function volume(client, interaction, lang) {
    try {
        const player = client.riffy.players.get(interaction.guildId);
        const volume = interaction.options.getInteger('level');

        if (!player) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ 
                    name: "Không có trình phát nào đang hoạt động!", 
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setFooter({ text: "Cảm ơn bạn đã sử dụng bot!", iconURL: musicIcons.heartIcon })
                .setDescription("Không có trình phát nhạc nào đang hoạt động trong máy chủ này.");

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        if (volume < 0 || volume > 100) {
            return interaction.reply({ content: "Vui lòng nhập mức âm lượng trong khoảng từ 0 đến 100!", ephemeral: true });
        }

        player.setVolume(volume);

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setAuthor({ 
                name: "Âm lượng đã được cập nhật!", 
                iconURL: musicIcons.volumeIcon,
                url: config.SupportServer
            })
            .setFooter({ text: "Cảm ơn bạn đã sử dụng bot!", iconURL: musicIcons.heartIcon })
            .setDescription(`Âm lượng đã được đặt thành ${volume}%`);

        return interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Lỗi khi đặt âm lượng:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ 
                name: "Lỗi", 
                iconURL: musicIcons.alertIcon,
                url: config.SupportServer
            })
            .setFooter({ text: "Cảm ơn bạn đã sử dụng bot!", iconURL: musicIcons.heartIcon })
            .setDescription("Đã xảy ra lỗi khi thay đổi âm lượng. Vui lòng thử lại sau!");

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

module.exports = {
    name: "volume",
    description: "Đặt âm lượng cho bài hát hiện tại",
    permissions: "0x0000000000000800",
    options: [{
        name: 'level',
        description: 'Mức âm lượng (0-100)',
        type: ApplicationCommandOptionType.Integer,
        required: true
    }],
    run: volume
};
