import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createConversation= mutation({
    args:{
        participants: v.array(v.id("users")),
        isGroup: v.boolean(),
        groupName: v.optional(v.string()),
        groupImage: v.optional(v.id("_storage")),
        admin: v.optional(v.id("users")),
    },
    handler: async (ctx,args)=> {
        const identity= await ctx.auth.getUserIdentity();
        if(!identity)
            throw new ConvexError("Authorized");
        const existingConversation= await ctx.db
        .query("conversations")
        .filter((q)=>
        q.or(
            q.eq(q.field("participants"),args.participants),
            q.eq(q.field("participants"),args.participants.reverse())
        )).first();

        if(existingConversation)
            return existingConversation._id;

        let groupImage;

        if(args.groupImage)
        {
            groupImage= (await ctx.storage.getUrl(args.groupImage)) as string;

        }

        const conversationId= await ctx.db.insert("conversations",{
            participants: args.participants,
            isGroup: args.isGroup,
            groupName: args.groupName,
            groupImage,
            admin: args.admin,
        });

        return conversationId;
    },
});

export const getMyConversations= query({
    args:{},
    handler: async(ctx,args)=> {
        const identity= await ctx.auth.getUserIdentity();
        if(!identity)
            throw new ConvexError("Unauthorized");
        const user= await ctx.db
        .query("users")
        .withIndex("by_tokenIdentifier",q=> q.eq("tokenIdentifier",identity.tokenIdentifier))
        .unique();

        if(!user)
            throw new ConvexError("User not found");

        const conversations= await ctx.db.query("conversations").collect();

        const myConversations= conversations.filter((conversation)=>{
            return conversation.participants.includes(user._id);
        });
        const conversationWithDetails= await Promise.all(
            myConversations.map(async (conversation)=>{
                let userDetails={};

                if(!conversation.isGroup)
                {
                    const otherUserId= conversation.participants.find((id)=> id!== user._id);

                    const userProfile= await ctx.db
                    .query("users")
                    .filter((q)=> q.eq(q.field("_id"),otherUserId))
                    .order("desc")
                    .take(1);

                    userDetails=userProfile[0];
                }
                const lastMessage= await ctx.db
                .query("messages")
                .filter((q)=>q.eq(q.field("conversation"),conversation._id))
                .order("desc")
                .take(1);

                return {
                    ...userDetails,
                    ...conversation,
                    lastMessage: lastMessage[0]||null,
                };
            })
        );
        return conversationWithDetails;
    }
})

export const kickUser= mutation({
    args:
    {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx,args)=>{
        const identity=await ctx.auth.getUserIdentity();
        
        if(!identity)
            throw new ConvexError("Unauthorized");
        
        const conversation= await ctx.db
        .query("conversations")
        .filter((q)=>q.eq(q.field("_id"),args.conversationId))
        .unique();

        if(!conversation)
            throw new ConvexError("Conversation not found");

        await ctx.db.patch(args.conversationId,{
            participants: conversation.participants.filter((id)=>id!==args.userId),
        });
    },
});

export const generateUploadUrl= mutation(async (ctx)=> {
    return await ctx.storage.generateUploadUrl();
});

export const deleteConversation = mutation({
    args: {
        conversationId: v.id("conversations"),
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

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation)
            throw new ConvexError("Conversation not found");

        // Check if user is part of the conversation
        if (!conversation.participants.includes(user._id))
            throw new ConvexError("You are not a part of this conversation");

        // For individual chats, if one person deletes, remove the other person from participants
        // For group chats, just remove the current user from participants
        if (!conversation.isGroup) {
            // Individual chat - remove the other participant
            const otherParticipant = conversation.participants.find(id => id !== user._id);
            if (otherParticipant) {
                await ctx.db.patch(args.conversationId, {
                    participants: [otherParticipant],
                });
            }
        } else {
            // Group chat - remove current user from participants
            const updatedParticipants = conversation.participants.filter(id => id !== user._id);
            await ctx.db.patch(args.conversationId, {
                participants: updatedParticipants,
            });
        }
    },
});