import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { supabase } from "~/lib/supabase";

// Interfaces for our message types
interface EncryptedMessage {
  ciphertext: string;
  metadata?: Record<string, any>;
}

export const messagesRouter = createTRPCRouter({
  // Get messages for a specific chat or channel
  getMessages: protectedProcedure
    .input(z.object({ 
      chatId: z.string(), 
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const { chatId, limit, cursor } = input;
      const userId = ctx.session.user.id;

      // Base query
      let query = supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: false })
        .limit(limit);

      // Add cursor if provided
      if (cursor) {
        query = query.lt("created_at", cursor);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch messages",
          cause: error,
        });
      }

      // Get the cursor for the next page
      let nextCursor: string | undefined = undefined;
      if (data && data.length === limit) {
        nextCursor = data[data.length - 1].created_at;
      }

      return {
        messages: data,
        nextCursor,
      };
    }),

  // Send a new encrypted message
  sendMessage: protectedProcedure
    .input(z.object({
      chatId: z.string(),
      encryptedContent: z.object({
        ciphertext: z.string(),
        metadata: z.record(z.any()).optional(),
      }),
      // Store minimal metadata about the message that doesn't compromise security
      messageType: z.enum(["TEXT", "IMAGE", "FILE", "VOICE"]).default("TEXT"),
      recipientId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { chatId, encryptedContent, messageType, recipientId } = input;
      const userId = ctx.session.user.id;

      // Insert the encrypted message
      const { data, error } = await supabase
        .from("messages")
        .insert({
          user_id: userId,
          chat_id: chatId,
          encrypted_content: encryptedContent,
          message_type: messageType,
          recipient_id: recipientId,
          // No plaintext content is stored on the server
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send message",
          cause: error,
        });
      }

      return data;
    }),

  // Delete a message (for current user's messages only)
  deleteMessage: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { messageId } = input;
      const userId = ctx.session.user.id;

      // Ensure the user can only delete their own messages
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId)
        .eq("user_id", userId);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete message",
          cause: error,
        });
      }

      return { success: true };
    }),

  // Reactions are also stored encrypted
  addReaction: protectedProcedure
    .input(z.object({
      messageId: z.string(),
      encryptedReaction: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { messageId, encryptedReaction } = input;
      const userId = ctx.session.user.id;

      const { data, error } = await supabase
        .from("message_reactions")
        .insert({
          user_id: userId,
          message_id: messageId,
          encrypted_reaction: encryptedReaction,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add reaction",
          cause: error,
        });
      }

      return data;
    }),

  // Get public keys for all members of a chat
  getChatMemberPublicKeys: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { chatId } = input;
      
      // First get all members of the chat
      const { data: members, error: membersError } = await supabase
        .from("chat_members")
        .select("user_id")
        .eq("chat_id", chatId);

      if (membersError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch chat members",
          cause: membersError,
        });
      }

      if (!members || members.length === 0) {
        return { keys: [] };
      }

      // Then get all public keys for those members
      const memberIds = members.map(member => member.user_id);
      
      const { data: keys, error: keysError } = await supabase
        .from("public_keys")
        .select("user_id, public_key, key_type, created_at")
        .in("user_id", memberIds);

      if (keysError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch public keys",
          cause: keysError,
        });
      }

      return { keys: keys || [] };
    }),

  // Store a new public key (e.g., after key rotation)
  storePublicKey: protectedProcedure
    .input(z.object({
      publicKey: z.string(),
      keyType: z.enum(["PRIMARY", "DEVICE", "BACKUP"]).default("PRIMARY"),
      deviceId: z.string().optional(),
      keyId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { publicKey, keyType, deviceId, keyId } = input;
      const userId = ctx.session.user.id;

      const { data, error } = await supabase
        .from("public_keys")
        .insert({
          user_id: userId,
          public_key: publicKey,
          key_type: keyType,
          device_id: deviceId,
          key_id: keyId,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to store public key",
          cause: error,
        });
      }

      return data;
    }),
}); 