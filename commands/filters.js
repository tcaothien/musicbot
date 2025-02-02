const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const config = require("../config.js");
const musicIcons = require('../UI/icons/musicicons.js');

async function filters(client, interaction, lang) {
    try {
        const player = client.riffy.players.get(interaction.guildId);

        if (!player) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({
                    name: "Lỗi",
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setFooter({ text: "Hỗ trợ", iconURL: musicIcons.heartIcon })
                .setDescription("Không có trình phát nào đang hoạt động trong máy chủ này.");

            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        if (!interaction.member.voice.channelId || interaction.member.voice.channelId !== player.voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({
                    name: "Lỗi",
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setFooter({ text: "Hỗ trợ", iconURL: musicIcons.heartIcon })
                .setDescription("Bạn cần tham gia kênh thoại cùng với bot để sử dụng lệnh này.");

            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const selectedFilter = interaction.options.getString('filter');

        if (selectedFilter === 'clear') {
            player.filters.clearFilters();
            await interaction.reply({ content: "Tất cả bộ lọc đã được xóa.", ephemeral: true });
            return;
        }

        switch (selectedFilter) {
            case 'karaoke':
                player.filters.setKaraoke(true);
                break;
            case 'timescale':
                player.filters.setTimescale(true, { speed: 1.2, pitch: 1.2 });
                break;
            case 'tremolo':
                player.filters.setTremolo(true, { frequency: 4, depth: 0.75 });
                break;
            case 'vibrato':
                player.filters.setVibrato(true, { frequency: 4, depth: 0.75 });
                break;
            case 'rotation':
                player.filters.setRotation(true, { rotationHz: 0.2 });
                break;
            case 'distortion':
                player.filters.setDistortion(true, { sinScale: 1, cosScale: 1 });
                break;
            case 'channelmix':
                player.filters.setChannelMix(true, { leftToLeft: 0.5, leftToRight: 0.5, rightToLeft: 0.5, rightToRight: 0.5 });
                break;
            case 'lowpass':
                player.filters.setLowPass(true, { smoothing: 0.5 });
                break;
            case 'bassboost':
                player.filters.setBassboost(true, { value: 3 });
                break;
            default:
                await interaction.reply({ content: "Bộ lọc không hợp lệ. Vui lòng chọn một bộ lọc từ danh sách.", ephemeral: true });
                return;
        }

        await interaction.reply({ content: `Bộ lọc **${selectedFilter}** đã được áp dụng.`, ephemeral: true });

    } catch (error) {
        console.error('Lỗi khi xử lý lệnh filters:', error);

        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({
                name: "Lỗi",
                iconURL: musicIcons.alertIcon,
                url: config.SupportServer
            })
            .setFooter({ text: "Hỗ trợ", iconURL: musicIcons.heartIcon })
            .setDescription("Đã xảy ra lỗi khi áp dụng bộ lọc. Vui lòng thử lại sau.");

        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ embeds: [errorEmbed] });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}

module.exports = {
    name: "filters",
    description: "Điều chỉnh bộ lọc âm thanh",
    permissions: "0x0000000000000800",
    options: [
        {
            name: 'filter',
            description: 'Chọn bộ lọc để áp dụng',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: 'Karaoke', value: 'karaoke' },
                { name: 'Tăng tốc độ', value: 'timescale' },
                { name: 'Tremolo', value: 'tremolo' },
                { name: 'Vibrato', value: 'vibrato' },
                { name: '3D', value: 'rotation' },
                { name: 'Biến dạng', value: 'distortion' },
                { name: 'Trộn kênh', value: 'channelmix' },
                { name: 'Lọc âm thấp', value: 'lowpass' },
                { name: 'Tăng bass', value: 'bassboost' },
                { name: 'Xóa bộ lọc', value: 'clear' }
            ]
        }
    ],
    run: filters
};
