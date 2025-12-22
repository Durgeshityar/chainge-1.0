import { IDatabaseAdapter } from '@/adapters/types';
import { ChatType } from '@/types';

// Simple UUID generator if not available
const uuid = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export async function seedMessagingData(database: IDatabaseAdapter) {
  // Check if we already have data
  const existingUsers = await database.list('user');
  if (existingUsers.length > 2) return; // Assume already seeded

  console.log('Seeding messaging data...');

  // Create Devanshi
  const devanshi = await database.create('user', {
    name: 'Devanshi',
    username: 'devanshi',
    email: 'devanshi@chainge.app',
    avatarUrl: 'https://i.pravatar.cc/150?u=devanshi',
    bio: 'Matched on football',
  });

  // Create Current User (if not exists, though usually auth creates one, let's assume one exists or create 'Me')
  // We'll look for the first user or create one
  let me = existingUsers[0];
  if (!me) {
     me = await database.create('user', {
        name: 'Me',
        username: 'me',
        email: 'me@chainge.app',
     });
  }

  // Create Chat with Devanshi
  const chat = await database.create('chat', {
    type: ChatType.DIRECT,
    name: undefined, // Direct chat usually has no name
  });

  // Add Participants
  await database.create('chatParticipant', {
    chatId: chat.id,
    userId: me.id,
  });
  await database.create('chatParticipant', {
    chatId: chat.id,
    userId: devanshi.id,
  });

  // Add generic messages
  await database.create('message', {
    chatId: chat.id,
    senderId: devanshi.id,
    content: 'You have matched for Football on 31st Oct 2025.',
  });

  await database.create('message', {
    chatId: chat.id,
    senderId: me.id,
    content: 'Text to be written here, Text to be written here',
  });
  
  await database.create('message', {
     chatId: chat.id,
     senderId: devanshi.id,
     content: 'Text to be written here, Text to be written here',
   });

  console.log('Seeding complete.');
}
