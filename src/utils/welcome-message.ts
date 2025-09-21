interface Message {
    content: string,
    components?: Array<any>
}

export function getWelcomeMessage(memberId: string): Message {
    return {
        content: `Hello <@${memberId}>, welcome to Communism Interstellar. How can we assist you today?
        
        Feel free to introduce yourself and let us know if you have any questions.
        
        I suggest that you start by reading our rules and other important information in <#welcome>. 

        A moderator will soon be with you to assign your roles and take care of your application to join us if that's your desire.`
    }
}

