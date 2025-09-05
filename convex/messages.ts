import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendTextMessage= mutation({
    args: {
        sender: v.string(),
        content: v.string(),
        conversation: v.id("conversations"),
    },
    handler: async (ctx,args)=>{
        const identity=await ctx.auth.getUserIdentity();
        if(!identity)
            throw new ConvexError("Not authenticated");

        const user= await ctx.db.query("users")
        .withIndex("by_tokenIdentifier",q=> q.eq("tokenIdentifier",identity.tokenIdentifier))
        .unique();

        if(!user)
            throw new ConvexError("User not found");
        const conversation= await ctx.db.query("conversations")
        .filter(q=> q.eq(q.field("_id"),args.conversation)).first();
        
        if(!conversation)
            throw new ConvexError("Conversation not found");
        
        if(!conversation.participants.includes(user._id))
            throw new ConvexError("You are not a part of this conversation");

        await ctx.db.insert("messages",{
            sender: args.sender,
            content: args.content,
            conversation: args.conversation,
            messageType: "text",
        });
    },
});

export const getMessages= query({
    args:
    {
        conversation: v.id("conversations"),
    },
    handler: async (ctx,args)=>
    {
        const identity= await ctx.auth.getUserIdentity();
        if(!identity)
            throw new ConvexError("Unauthorized");

        const messages= await ctx.db
        .query("messages")
        .withIndex("by_conversation",(q)=>q.eq("conversation",args.conversation))
        .collect();

        const userProfileCache= new Map();

        const messagesWithSender= await Promise.all(
            messages.map(async (message)=>{
                let sender;
                if(userProfileCache.has(message.sender)){
                    sender= userProfileCache.get(message.sender);
                }
                else
                {
                    sender= await ctx.db
                    .query("users")
                    .filter(q=>q.eq(q.field("_id"),message.sender))
                    .first();

                    userProfileCache.set(message.sender,sender);
                }

                return {...message,sender};
            })
        );
        return messagesWithSender;
    },
});

export const sendImage= mutation({
    args: {
        imgId: v.id("_storage"),
        sender:v.id("users"),
        conversation: v.id("conversations")
    },
    handler: async (ctx, args) => {
        const identity=await ctx.auth.getUserIdentity();
        if(!identity)
            throw new ConvexError("Unauthorized");

        const content= (await ctx.storage.getUrl(args.imgId)) as string;

        await ctx.db.insert("messages",{
            content: content,
            sender: args.sender,
            messageType: "image",
            conversation: args.conversation,
        });
    },
});

export const sendVideo= mutation({
    args:{
        videoId: v.id("_storage"),
        sender: v.id("users"),
        conversation: v.id("conversations")
    },
    handler: async (ctx,args)=>{
        const identity=await ctx.auth.getUserIdentity();
        if(!identity)
            throw new ConvexError("Unauthorized");
        
        const content= (await ctx.storage.getUrl(args.videoId)) as string;

        await ctx.db.insert("messages",{
            content: content,
            sender: args.sender,
            messageType: "video",
            conversation: args.conversation,
        });
    },
});

export const sendAudio = mutation({
    args: {
        audioId: v.id("_storage"),
        sender: v.id("users"),
        conversation: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new ConvexError("Unauthorized");

        const content = (await ctx.storage.getUrl(args.audioId)) as string;

        await ctx.db.insert("messages", {
            content,
            sender: args.sender,
            messageType: "audio",
            conversation: args.conversation,
        });
    },
});

export const deleteMessage = mutation({
    args: {
        messageId: v.id("messages"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new ConvexError("Unauthorized");

        const user = await ctx.db.query("users")
            .withIndex("by_tokenIdentifier", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user)
            throw new ConvexError("User not found");

        const message = await ctx.db.get(args.messageId);
        if (!message)
            throw new ConvexError("Message not found");

        // Check if user is the sender of the message
        if (message.sender !== user._id)
            throw new ConvexError("You can only delete your own messages");

        // Check if user is part of the conversation
        const conversation = await ctx.db.get(message.conversation);
        if (!conversation)
            throw new ConvexError("Conversation not found");

        if (!conversation.participants.includes(user._id))
            throw new ConvexError("You are not a part of this conversation");

        // Mark message as deleted
        await ctx.db.patch(args.messageId, {
            isDeleted: true,
            deletedBy: user._id,
            content: "This message is deleted",
        });
    },
});

// export const getMessages= query({
//     args:{
//         conversation: v.id("conversations"),
//     },
//     handler: async(ctx,args)=>
//     {
//         const identity=await ctx.auth.getUserIdentity();
//         if(!identity)
//             throw new ConvexError("Not authenicated");

//         const messages= await ctx.db
//         .query("messages")
//         .withIndex("by_conversation",q=>q.eq("conversation",args.conversation))
//         .collect();

//         const messagesWithSender= await Promise.all(
//             messages.map(async (message)=> {
//                 const sender= await ctx.db
//                 .query("users")
//                 .filter(q=>q.eq(q.field("_id"),message.sender))
//                 .first();

//                 return {...message,sender}
//             })
//         )
//         return messagesWithSender;
//     }
// })