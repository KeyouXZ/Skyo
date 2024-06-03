module.exports = async (client, message) => {
    if (message.channel.type != 1) return message.reply("Please use this in a Direct Message")

    let i = client.tmp[2].get(message.author.id);

    if (message.body == client.tmp[1].get(message.author.id)) {
        message.author.send("Logout Successful")
        client.tmp[1].delete(message.author.id)
        client.tmp[2].delete(message.author.id)
        client.state.delete(message.author.id)
    } else if (i > 0) {
        client.tmp[2].set(message.author.id, i-1)
        message.author.send("Invalid answers")
        message.author.send(i + " attempts remaining")
    } else {
        message.author.send("Logout Failed")
        client.tmp[1].delete(message.author.id)
        client.tmp[2].delete(message.author.id)
        client.state.delete(message.author.id)
    }

}