const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { autoplayCollection } = require('../mongodb.js');
const musicIcons = require('../UI/icons/musicicons.js');
const config = require('../config.js');

async function toggleAutoplay(client, interaction, lang) {
    try {
        const enable = interaction.options.getBoolean('enable');
        const guildId = interaction.guild.id;

        await autoplayCollection.updateOne(
            { guildId },
            { $set: { autoplay: enable } },
            { upsert: true }
        );

        const embed = new EmbedBuilder()
            .setColor(enable ? '#00ff00' : '#ff0000')
            .setAuthor({ 
                name: "Cập nhật chế độ tự động phát", 
                iconURL: musicIcons.correctIcon,
                url: config.SupportServer 
            })
            .setFooter({ text: "Hỗ trợ", iconURL: musicIcons.heartIcon })
            .setTimestamp()
            .setDescription(`Chế độ tự động phát đã được ${enable ? "bật" : "tắt"}.`);

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Lỗi khi chuyển đổi chế độ tự động phát:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ 
                name: "Lỗi", 
                iconURL: musicIcons.alertIcon,
                url: config.SupportServer 
            })
            .setFooter({ text: "Hỗ trợ", iconURL: musicIcons.heartIcon })
            .setTimestamp()
            .setDescription("Đã xảy ra lỗi khi cập nhật chế độ tự động phát. Vui lòng thử lại sau.");

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

module.exports = {
    name: 'autoplay',
    description: 'Bật hoặc tắt chế độ tự động phát trong máy chủ',
    permissions: '0x0000000000000800',
    options: [
        {
            name: 'enable',
            description: 'Bật / Tắt chế độ tự động phát',
            type: ApplicationCommandOptionType.Boolean,
            required: true
        }
    ],
    run: toggleAutoplay
};
