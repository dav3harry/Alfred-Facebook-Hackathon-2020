const Information = require('./Information');
class Response{
    static genQuickReply(text, quickReplies) {
        let response = {
            text: text,
            quick_replies: []
        };

        for (let quickReply of quickReplies) {
            response["quick_replies"].push({
                content_type: "text",
                title: quickReply["title"],
                payload: quickReply["payload"]
            });
        }

        return response;
    }

    static genTextReply(text){
        let response = {
            text: text
        };
        return response
    }

    static genAttachmentReply(){
        let response = {
            "attachment":{
                "type":"image",
                "payload":{
                    "attachment_id": "235306070839999"
                }
            }
        };
        return response
    }

    static getAnimation( state ){
        let response;

        if( state === "on" ){
            response = {
                sender_action : "typing_on"
            }
        }

        else{
            response = {
                sender_action : "typing_off"
            }

        }

        return response;
    }

    static getFlightDetails( userData ){
        return Information.flightDetails( userData );
    }

    static getFlightView( to, from, date ){
        console.log('_______________________________________--------------------------___________________________');
        console.log( Information.flightInformation(to, from, date) );
        
        let response = {
            "attachment": {             
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": Information.flightInformation(to, from, date)
                }
            }
        }

        return response;
    }


    static genWebView(){
        let link = "https://www.whitewall.site.s3-website-us-west-2.amazonaws.com/bizbotteuxdeux";
        let response = {
            "attachment":{
                "type":"template",
                    "payload":{
                    "template_type":"button",
                        "text":"Create a reminder!",
                        "buttons":[
                        {
                            "type":"web_url",
                            "url": link,
                            "title":"Reminders",
                            "webview_height_ratio": "full"
                        }
                    ]
                }
            }
        }
        return response;
    }

}

module.exports =  Response;