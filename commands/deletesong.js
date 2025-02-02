const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { playlistCollection } = require('../mongodb.js');
const config = require('../config.js');
const musicIcons = require('../UI/icons/musicicons.js');

async function deleteSong(client, interaction, lang) {
    try {
        const playlistName = interaction.options.getString('playlist');
        const songName = interaction.options.getString('song');

        const playlist = await playlistCollection.findOne({ name: playlistName });
        if (!playlist) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ 
                    name: "Không tìm thấy danh sách phát", 
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setDescription("Danh sách phát bạn muốn chỉnh sửa không tồn tại.")
                .setFooter({ text: "Hỗ trợ", iconURL: musicIcons.heartIcon })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        await playlistCollection.updateOne({ name: playlistName }, { $pull: { songs: { name: songName } } });
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setAuthor({ 
                name: "Đã xóa bài hát", 
                iconURL: musicIcons.correctIcon,
                url: config.SupportServer
            })
            .setDescription(`Bài hát **${songName}** đã được xóa khỏi danh sách phát **${playlistName}**.`)
            .setFooter({ text: "Hỗ trợ", iconURL: musicIcons.heartIcon })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Lỗi khi xóa bài hát:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ 
                name: "Lỗi", 
                iconURL: musicIcons.alertIcon,
                url: config.SupportServer
            })
            .setFooter({ text: "Hỗ trợ", iconURL: musicIcons.heartIcon })
            .setTimestamp()
            .setDescription("Đã xảy ra lỗi khi xóa bài hát. Vui lòng thử lại sau.");

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

module.exports = {
    name: 'deletesong',
    description: 'Xóa một bài hát khỏi danh sách phát',
    permissions: '0x0000000000000800',
    options: [
        {
            name: 'playlist',
            description: 'Nhập tên danh sách phát',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'song',
            description: 'Nhập tên bài hát',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: deleteSong
};
