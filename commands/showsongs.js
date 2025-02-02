const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { playlistCollection } = require('../mongodb.js');
const config = require("../config.js");
const musicIcons = require('../UI/icons/musicicons.js');

async function showSongs(client, interaction, lang) {
    try {
        const playlistName = interaction.options.getString('playlist');
        const userId = interaction.user.id;

        const playlist = await playlistCollection.findOne({ name: playlistName });
        if (!playlist) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ 
                    name: "Lỗi", 
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setFooter({ text: "Cảm ơn bạn đã sử dụng bot!", iconURL: musicIcons.heartIcon })
                .setDescription("Không tìm thấy danh sách phát. Vui lòng kiểm tra lại tên danh sách!");

            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        if (playlist.isPrivate && playlist.userId !== userId) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ 
                    name: "Truy cập bị từ chối", 
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setFooter({ text: "Cảm ơn bạn đã sử dụng bot!", iconURL: musicIcons.heartIcon })
                .setDescription("Bạn không có quyền truy cập danh sách phát này!");

            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const chunkSize = 10;
        const songChunks = [];
        for (let i = 0; i < playlist.songs.length; i += chunkSize) {
            songChunks.push(playlist.songs.slice(i, i + chunkSize));
        }

        if (songChunks.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({ 
                    name: `Danh sách bài hát trong "${playlistName}"`, 
                    iconURL: musicIcons.playlistIcon,
                    url: config.SupportServer
                })
                .setFooter({ text: "Cảm ơn bạn đã sử dụng bot!", iconURL: musicIcons.heartIcon })
                .setDescription("Danh sách phát này không có bài hát nào.");

            await interaction.reply({ embeds: [embed] });
            return;
        }

        for (const [index, chunk] of songChunks.entries()) {
            const description = chunk
                .map((song, i) => `${index * chunkSize + i + 1}. ${song.name || song.url}`)
                .join('\n');

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({ 
                    name: `Danh sách bài hát trong "${playlistName}" (Trang ${index + 1}/${songChunks.length})`, 
                    iconURL: musicIcons.playlistIcon,
                    url: config.SupportServer
                })
                .setFooter({ text: "Cảm ơn bạn đã sử dụng bot!", iconURL: musicIcons.heartIcon })
                .setDescription(description);

            await interaction.reply({ embeds: [embed], ephemeral: index !== 0 }); 
        }
    } catch (error) {
        console.error('Lỗi khi hiển thị danh sách bài hát:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ 
                name: "Lỗi", 
                iconURL: musicIcons.alertIcon,
                url: config.SupportServer
            })
            .setFooter({ text: "Cảm ơn bạn đã sử dụng bot!", iconURL: musicIcons.heartIcon })
            .setDescription("Đã xảy ra lỗi khi lấy danh sách bài hát. Vui lòng thử lại sau!");

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

module.exports = {
    name: 'showsongs',
    description: 'Hiển thị tất cả bài hát trong danh sách phát',
    permissions: '0x0000000000000800',
    options: [
        {
            name: 'playlist',
            description: 'Nhập tên danh sách phát',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: showSongs
};
