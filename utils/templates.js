const errorMsg = (user, description) => {
    return {
        color: "#70D9F3",
        author: {
            name: "We have encountered an error",
        },
        description: `・${description}`,
        footer: {
            text: `Executed by ${user.tag}`,
            icon_url: user.avatarURL({ dynamic: true }),
        }
    };
}

const successMsg = (user, description) => {
    return {
        color: "#70D9F3",
        author: {
            name: "Success!",
        },
        description: `・${description}`,
        footer: {
            text: `Executed by ${user.tag}`,
            icon_url: user.avatarURL({ dynamic: true }),
        }
    };
}

const capitalizeFirstLetter = (string) =>  {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = { errorMsg, successMsg, capitalizeFirstLetter };