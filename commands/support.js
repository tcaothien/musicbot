const { EmbedBuilder } = require('discord.js');
const config = require("../config.js");
const musicIcons = require('../UI/icons/musicicons.js');

module.exports = {
    name: "support",
    description: "Nhận liên kết máy chủ hỗ trợ",
    permissions: "0x0000000000000800",
    options: [],
    run: async (client, interaction, lang) => {
        try {
            const supportServerLink = "https://discord.gg/NewLifes";
          
            const embed = new EmbedBuilder()
                .setColor('#b300ff')
                .setAuthor({
                    name: "Máy chủ hỗ trợ",
                    iconURL: musicIcons.beats2Icon, 
                    url: config.SupportServer
                })
                .setDescription(`Nếu bạn cần hỗ trợ, hãy tham gia máy chủ hỗ trợ của chúng tôi tại: [Nhấp vào đây](${supportServerLink})`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({
                    name: "Lỗi",
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setDescription("Đã xảy ra lỗi khi lấy liên kết máy chủ hỗ trợ. Vui lòng thử lại sau!")
                .setFooter({ text: "Cảm ơn bạn đã sử dụng bot!", iconURL: musicIcons.heartIcon });

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
