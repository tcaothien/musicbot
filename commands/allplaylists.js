const { EmbedBuilder } = require('discord.js');
const { playlistCollection } = require('../mongodb.js');
const musicIcons = require('../UI/icons/musicicons.js');
const config = require('../config.js');

async function allPlaylists(client, interaction, lang) {
    try {
        const playlists = await playlistCollection.find({ isPrivate: false }).toArray();

        if (!playlists.length) {
            const noPlaylistsEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ 
                    name: "Không tìm thấy danh sách phát nào", 
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setDescription("Hiện tại không có danh sách phát công khai nào.")
                .setFooter({ text: "Hỗ trợ", iconURL: musicIcons.heartIcon })
                .setTimestamp();

            await interaction.reply({ embeds: [noPlaylistsEmbed] });
            return;
        }

        const chunkSize = 10;
        const chunks = [];
        for (let i = 0; i < playlists.length; i += chunkSize) {
            chunks.push(playlists.slice(i, i + chunkSize));
        }

        const embeds = chunks.map((chunk, index) => {
            const description = chunk
                .map((playlist, idx) => 
                    `**${index * chunkSize + idx + 1}.** **${playlist.name}**\n` +
                    `   - Được tạo bởi: <@${playlist.userId}>\n` +
                    `   - Máy chủ: ${playlist.serverName}\n` +
                    `   - Số bài hát: ${playlist.songs.length}`
                )
                .join('\n\n');

            return new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({ 
                    name: `Danh sách phát công khai (${index + 1}/${chunks.length})`, 
                    iconURL: musicIcons.playlistIcon,
                    url: config.SupportServer
                })
                .setDescription(description)
                .setFooter({ text: "Hỗ trợ", iconURL: musicIcons.heartIcon })
                .setTimestamp();
        });

        for (const embed of embeds) {
            await interaction.reply({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phát:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ 
                name: "Lỗi", 
                iconURL: musicIcons.alertIcon,
                url: config.SupportServer
            })
            .setFooter({ text: "Hỗ trợ", iconURL: musicIcons.heartIcon })
            .setTimestamp()
            .setDescription("Đã xảy ra lỗi khi lấy danh sách phát. Vui lòng thử lại sau.");

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

module.exports = {
    name: 'allplaylists',
    description: 'Liệt kê tất cả danh sách phát công khai',
    permissions: '0x0000000000000800',
    run: allPlaylists
};
