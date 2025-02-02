const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { playlistCollection } = require('../mongodb.js');
const musicIcons = require('../UI/icons/musicicons.js');
const config = require('../config.js');

async function deletePlaylist(client, interaction, lang) {
    try {
        const playlistName = interaction.options.getString('name');
        const userId = interaction.user.id;

        const playlist = await playlistCollection.findOne({ name: playlistName });
        if (!playlist) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ 
                    name: "Không tìm thấy danh sách phát", 
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setDescription("Danh sách phát bạn muốn xóa không tồn tại.")
                .setFooter({ text: "Hỗ trợ", iconURL: musicIcons.heartIcon })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        if (playlist.userId !== userId) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ 
                    name: "Truy cập bị từ chối", 
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setDescription("Bạn không có quyền xóa danh sách phát này.")
                .setFooter({ text: "Hỗ trợ", iconURL: musicIcons.heartIcon })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const result = await playlistCollection.deleteOne({ name: playlistName, userId: userId });
        if (result.deletedCount === 0) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ 
                    name: "Không tìm thấy danh sách phát", 
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setDescription("Danh sách phát bạn muốn xóa không tồn tại.")
                .setFooter({ text: "Hỗ trợ", iconURL: musicIcons.heartIcon })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setAuthor({ 
                name: "Danh sách phát đã bị xóa", 
                iconURL: musicIcons.correctIcon,
                url: config.SupportServer
            })
            .setDescription(`Danh sách phát **${playlistName}** đã được xóa thành công.`)
            .setFooter({ text: "Hỗ trợ", iconURL: musicIcons.heartIcon })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Lỗi khi xóa danh sách phát:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ 
                name: "Lỗi", 
                iconURL: musicIcons.alertIcon,
                url: config.SupportServer
            })
            .setFooter({ text: "Hỗ trợ", iconURL: musicIcons.heartIcon })
            .setTimestamp()
            .setDescription("Đã xảy ra lỗi khi xóa danh sách phát. Vui lòng thử lại sau.");

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

module.exports = {
    name: 'deleteplaylist',
    description: 'Xóa một danh sách phát',
    permissions: '0x0000000000000800',
    options: [
        {
            name: 'name',
            description: 'Nhập tên danh sách phát',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: deletePlaylist
};
