const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { playlistCollection } = require('../mongodb.js');
const musicIcons = require('../UI/icons/musicicons.js');
const config = require('../config.js');

async function createPlaylist(client, interaction, lang) {
    try {
        const playlistName = interaction.options.getString('name');
        const isPrivate = interaction.options.getBoolean('private');
        const userId = interaction.user.id;
        const serverId = interaction.guild.id;
        const serverName = interaction.guild.name;

        const existingPlaylist = await playlistCollection.findOne({ 
            name: playlistName, 
            serverId: serverId,
            ...(isPrivate ? { userId: userId } : {}) 
        });

        if (existingPlaylist) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ 
                    name: "Danh sách phát đã tồn tại", 
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setFooter({ text: "Hỗ trợ", iconURL: musicIcons.heartIcon })
                .setTimestamp()
                .setDescription("Danh sách phát với tên này đã tồn tại. Vui lòng chọn một tên khác.");

            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        await playlistCollection.insertOne({ 
            name: playlistName, 
            songs: [], 
            isPrivate: isPrivate, 
            userId: userId, 
            serverId: serverId, 
            serverName: serverName 
        });

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setAuthor({ 
                name: "Danh sách phát đã được tạo", 
                iconURL: musicIcons.correctIcon,
                url: config.SupportServer
            })
            .setFooter({ text: "Hỗ trợ", iconURL: musicIcons.heartIcon })
            .setTimestamp()
            .setDescription(`Danh sách phát **${playlistName}** đã được tạo thành công với chế độ ${isPrivate ? "Riêng tư" : "Công khai"}.`);

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Lỗi khi tạo danh sách phát:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ 
                name: "Lỗi", 
                iconURL: musicIcons.alertIcon,
                url: config.SupportServer
            })
            .setFooter({ text: "Hỗ trợ", iconURL: musicIcons.heartIcon })
            .setTimestamp()
            .setDescription("Đã xảy ra lỗi khi tạo danh sách phát. Vui lòng thử lại sau.");

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

module.exports = {
    name: 'createplaylist',
    description: 'Tạo danh sách phát mới',
    permissions: '0x0000000000000800',
    options: [
        {
            name: 'name',
            description: 'Nhập tên danh sách phát',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'private',
            description: 'Đặt danh sách phát là riêng tư (chỉ bạn có thể xem)',
            type: ApplicationCommandOptionType.Boolean,
            required: true
        }
    ],
    run: createPlaylist
};
