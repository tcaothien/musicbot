const { Riffy } = require("riffy");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, PermissionsBitField } = require("discord.js");
const { queueNames, requesters } = require("./commands/play");
const { Dynamic } = require("musicard");
const config = require("./config.js");
const musicIcons = require('./UI/icons/musicicons.js');
const colors = require('./UI/colors/colors');
const fs = require("fs");
const path = require("path");
const { autoplayCollection } = require('./mongodb.js');

async function sendMessageWithPermissionsCheck(channel, embed, attachment, actionRow1, actionRow2) {
    try {
   
        const permissions = channel.permissionsFor(channel.guild.members.me);
        if (!permissions.has(PermissionsBitField.Flags.SendMessages) ||
            !permissions.has(PermissionsBitField.Flags.EmbedLinks) ||
            !permissions.has(PermissionsBitField.Flags.AttachFiles) ||
            !permissions.has(PermissionsBitField.Flags.UseExternalEmojis)) {
            console.error("Bot thiếu quyền gửi tin nhắn trong kênh này.");
            return;
        }

        const message = await channel.send({
            embeds: [embed],
            files: [attachment],
            components: [actionRow1, actionRow2]
        });
        return message;
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error.message);
        const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setDescription("⚠️ **Không thể gửi tin nhắn. Kiểm tra quyền của bot.**");
        await channel.send({ embeds: [errorEmbed] });
    }
}

function initializePlayer(client) {
    const nodes = config.nodes.map(node => ({
        name: node.name,
        host: node.host,
        port: node.port,
        password: node.password,
        secure: node.secure,
        reconnectTimeout: 5000,
        reconnectTries: Infinity
    }));

    client.riffy = new Riffy(client, nodes, {
        send: (payload) => {
            const guildId = payload.d.guild_id;
            if (!guildId) return;

            const guild = client.guilds.cache.get(guildId);
            if (guild) guild.shard.send(payload);
        },
        defaultSearchPlatform: "ytmsearch",
        restVersion: "v4",
    });

    let currentTrackMessageId = null;
    let collector = null;

    client.riffy.on("nodeConnect", node => {
        console.log(`${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.green}Node ${node.name} Connected ✅${colors.reset}`);
    });
    
    client.riffy.on("nodeError", (node, error) => {
        console.log(`${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.red}Node ${node.name} Error ❌ | ${error.message}${colors.reset}`);
    });

    client.riffy.on("trackStart", async (player, track) => {
        const channel = client.channels.cache.get(player.textChannel);
        const trackUri = track.info.uri;
        const requester = requesters.get(trackUri);

        try {
            const musicard = await Dynamic({
                thumbnailImage: track.info.thumbnail || 'https://example.com/default_thumbnail.png',
                backgroundColor: '#070707',
                progress: 10,
                progressColor: '#FF7A00',
                progressBarColor: '#5F2D00',
                name: track.info.title,
                nameColor: '#FF7A00',
                author: track.info.author || 'Unknown Artist',
                authorColor: '#696969',
            });

            // Save the generated card to a file
            const cardPath = path.join(__dirname, 'musicard.png');
            fs.writeFileSync(cardPath, musicard);

            // Prepare the attachment and embed
            const attachment = new AttachmentBuilder(cardPath, { name: 'musicard.png' });
            const embed = new EmbedBuilder()
            .setAuthor({ 
                name: 'Đang phát bài hát..', 
                iconURL: musicIcons.playerIcon,
                url: config.SupportServer
            })
            .setFooter({ text: `Phát triển bởi New Life | New Life Music v1.2`, iconURL: musicIcons.heartIcon })
            .setTimestamp()
            .setDescription(  
                `- **Tiêu đề:** [${track.info.title}](${track.info.uri})\n` +
                `- **Tác giả:** ${track.info.author || 'Nghệ sĩ không xác định'}\n` +
                `- **Thời gian:** ${formatDuration(track.info.length)}\n` +
                `- **Người yêu cầu:** ${requester}\n` +
                `- **Nguồn:** ${track.info.sourceName}\n`
            )
            .setImage('attachment://musicard.png')
            .setColor('#FF7A00');

            const actionRow1 = createActionRow1(false);
            const actionRow2 = createActionRow2(false);

            const message = await sendMessageWithPermissionsCheck(channel, embed, attachment, actionRow1, actionRow2);
            if (message) {
                currentTrackMessageId = message.id;

                if (collector) collector.stop(); 
                collector = setupCollector(client, player, channel, message);
            }

        } catch (error) {
            console.error("Lỗi khi tạo hoặc gửi thẻ bài nhạc:", error.message);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription("⚠️ **Không thể tải thẻ bài nhạc. Tiếp tục phát nhạc...**");
            await channel.send({ embeds: [errorEmbed] });
        }
    });

    
    client.riffy.on("trackEnd", async (player) => {
        await disableTrackMessage(client, player);
        currentTrackMessageId = null;
    });

    client.riffy.on("playerDisconnect", async (player) => {
        await disableTrackMessage(client, player);
        currentTrackMessageId = null;
    });

    client.riffy.on("queueEnd", async (player) => {
        const channel = client.channels.cache.get(player.textChannel);
        const guildId = player.guildId;
    
        try {
         
            const autoplaySetting = await autoplayCollection.findOne({ guildId });
    
            if (autoplaySetting?.autoplay) {
                const nextTrack = await player.autoplay(player);
    
                if (!nextTrack) {
                    player.destroy();
                    await channel.send("⚠️ **Không còn bài hát nào để tự động phát. Đang ngắt kết nối...**");
                }
            } else {
                console.log(`Tự động phát bị tắt cho guild: ${guildId}`);
                player.destroy();
                await channel.send("🎶 **Hàng đợi đã kết thúc. Tự động phát bị tắt.**");
            }
        } catch (error) {
            console.error("Lỗi khi xử lý tự động phát:", error);
            player.destroy();
            await channel.send("👾**Hàng đợi trống! Đang ngắt kết nối...**");
        }
    });
    
    async function disableTrackMessage(client, player) {
        const channel = client.channels.cache.get(player.textChannel);
        if (!channel || !currentTrackMessageId) return;

        try {
            const message = await channel.messages.fetch(currentTrackMessageId);
            if (message) {
                const disabledRow1 = createActionRow1(true);
                const disabledRow2 = createActionRow2(true);
                await message.edit({ components: [disabledRow1, disabledRow2] });
            }
        } catch (error) {
            console.error("Không thể vô hiệu hóa các thành phần tin nhắn:", error);
        }
    }
}

function formatDuration(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    return [
        hours > 0 ? `${hours}h` : null,
        minutes > 0 ? `${minutes}m` : null,
        `${seconds}s`,
    ]
        .filter(Boolean)
        .join(' ');
}

function setupCollector(client, player, channel, message) {
    const filter = i => [
        'loopToggle', 'skipTrack', 'stopTrack', 'disableLoop',
        'pauseTrack', 'resumeTrack', 'volumeUp', 'volumeDown'
    ].includes(i.customId);

    const collector = message.createMessageComponentCollector({ filter, time: 600000 }); // Set timeout if desired

    collector.on('collect', async i => {
        await i.deferUpdate();

        const member = i.member;
        const voiceChannel = member.voice.channel;
        const playerChannel = player.voiceChannel;

        if (!voiceChannel || voiceChannel.id !== playerChannel) {
            const vcEmbed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setDescription('🔒 **Bạn cần ở cùng một kênh thoại để sử dụng điều khiển!**');
            const sentMessage = await channel.send({ embeds: [vcEmbed] });
            setTimeout(() => sentMessage.delete().catch(console.error), config.embedTimeout * 1000);
            return;
        }

        handleInteraction(i, player, channel);
    });

    collector.on('end', () => {
        console.log("Collector stopped.");
    });

    return collector;
}

async function handleInteraction(i, player, channel) {
    switch (i.customId) {
        case 'loopToggle':
            toggleLoop(player, channel);
            break;
        case 'skipTrack':
            player.stop();
            await sendEmbed(channel, "⏭️ **Player sẽ phát bài tiếp theo!**");
            break;
        case 'disableLoop':
            disableLoop(player, channel);
            break;
        case 'showQueue':
            showQueue(channel);
            break;
        case 'clearQueue':
            player.queue.clear();
            await sendEmbed(channel, "🗑️ **Hàng đợi đã được xóa!**");
            break;
        case 'stopTrack':
            player.stop();
            player.destroy();
            await sendEmbed(channel, '⏹️ **Đã dừng phát và hủy player!**');
            break;
        case 'pauseTrack':
            if (player.paused) {
                await sendEmbed(channel, '⏸️ **Phát nhạc đã tạm dừng rồi!**');
            } else {
                player.pause(true);
                await sendEmbed(channel, '⏸️ **Phát nhạc đã tạm dừng!**');
            }
            break;
        case 'resumeTrack':
            if (!player.paused) {
                await sendEmbed(channel, '▶️ **Phát nhạc đã tiếp tục rồi!**');
            } else {
                player.pause(false);
                await sendEmbed(channel, '▶️ **Phát nhạc đã tiếp tục!**');
            }
            break;
        case 'volumeUp':
            adjustVolume(player, channel, 10);
            break;
        case 'volumeDown':
            adjustVolume(player, channel, -10);
            break;
    }
}

async function sendEmbed(channel, message) {
    const embed = new EmbedBuilder().setColor(config.embedColor).setDescription(message);
    const sentMessage = await channel.send({ embeds: [embed] });
    setTimeout(() => sentMessage.delete().catch(console.error), config.embedTimeout * 1000);
}

function adjustVolume(player, channel, amount) {
    const newVolume = Math.min(100, Math.max(10, player.volume + amount));
    if (newVolume === player.volume) {
        sendEmbed(channel, amount > 0 ? '🔊 **Âm lượng đã đạt mức tối đa!**' : '🔉 **Âm lượng đã ở mức tối thiểu!**');
    } else {
        player.setVolume(newVolume);
        sendEmbed(channel, `🔊 **Âm lượng đã thay đổi thành ${newVolume}%!**`);
    }
}

function formatTrack(track) {
    if (!track || typeof track !== 'string') return track;
    
    const match = track.match(/\[(.*?) - (.*?)\]\((.*?)\)/);
    if (match) {
        const [, title, author, uri] = match;
        return `[${title} - ${author}](${uri})`;
    }
    
    return track;
}

function toggleLoop(player, channel) {
    player.setLoop(player.loop === "track" ? "queue" : "track");
    sendEmbed(channel, player.loop === "track" ? "🔁 **Lặp lại bài hát đã được kích hoạt!**" : "🔁 **Lặp lại hàng đợi đã được kích hoạt!**");
}

function disableLoop(player, channel) {
    player.setLoop("none");
    sendEmbed(channel, "❌ **Lặp lại đã bị tắt!**");
}

function showQueue(channel) {
    if (queueNames.length === 0) {
        sendEmbed(channel, "Hàng đợi trống.");
        return;
    }
    const queueChunks = [];

    for (let i = 1; i < queueNames.length; i += 10) {
        const chunk = queueNames.slice(i, i + 10)
            .map((song, index) => `${i + index}. ${formatTrack(song)}`)
            .join('\n');
        queueChunks.push(chunk);
    }

    channel.send({
        embeds: [new EmbedBuilder().setColor(config.embedColor).setDescription(nowPlaying)]
    }).catch(console.error);

    queueChunks.forEach(async (chunk) => {
        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setDescription(`📜 **Hàng đợi:**\n${chunk}`);
        await channel.send({ embeds: [embed] }).catch(console.error);
    });
}

function createActionRow1(disabled) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId("loopToggle").setEmoji('🔁').setStyle(ButtonStyle.Secondary).setDisabled(disabled),
            new ButtonBuilder().setCustomId("disableLoop").setEmoji('❌').setStyle(ButtonStyle.Secondary).setDisabled(disabled),
            new ButtonBuilder().setCustomId("stopTrack").setEmoji('⏹️').setStyle(ButtonStyle.Danger).setDisabled(disabled),
            new ButtonBuilder().setCustomId("skipTrack").setEmoji('⏭️').setStyle(ButtonStyle.Secondary).setDisabled(disabled)
          
        );
}

function createActionRow2(disabled) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId("pauseTrack").setEmoji('⏸️').setStyle(ButtonStyle.Secondary).setDisabled(disabled),
            new ButtonBuilder().setCustomId("resumeTrack").setEmoji('▶️').setStyle(ButtonStyle.Secondary).setDisabled(disabled),
            new ButtonBuilder().setCustomId("volumeUp").setEmoji('🔊').setStyle(ButtonStyle.Secondary).setDisabled(disabled),
            new ButtonBuilder().setCustomId("volumeDown").setEmoji('🔉').setStyle(ButtonStyle.Secondary).setDisabled(disabled)
        );
}

module.exports = { initializePlayer };
