import {ImapFlow} from 'imapflow';
import { createWriteStream } from 'node:fs';
import { simpleParser } from 'mailparser';
import config from '../../utils/config';
import { isNull } from 'lodash';


const run =async () => {

  if (
    isNull(config.inbox.user) ||
    isNull(config.inbox.host) ||
    isNull(config.inbox.password)
  ) {
    console.warn("Impossible d'accéder à la boite email car les variables INBOX ne sont pas définies")
    return
  }
  
  const client = new ImapFlow({
    host: config.inbox.host,
    auth: {
      user: config.inbox.user,
      pass: config.inbox.password 
    },
    port: config.inbox.port,
    secure: true,
    logger: false
  });
  await client.connect()
// Select and lock a mailbox. Throws if mailbox does not exist
  const lock = await client.getMailboxLock('INBOX');
  try {
    // fetch latest message source
    // client.mailbox includes information about currently selected mailbox
    // "exists" value is also the largest sequence number available in the mailbox
    if( typeof client.mailbox  !== 'boolean' ) {
      // const message = await client.fetchOne(`${client.mailbox.exists}`, { source: true });
      // console.log(message.source.toString());

      // let pj = null
      // list subjects for all messages
      // uid value is always included in FETCH response, envelope strings are in unicode.
    //   for await (const message of client.fetch('1:*', { envelope: true, bodyStructure: true })) {
    //
    //     if( message.uid === 4767){
    //
    //
    //     if (message.bodyStructure.childNodes.length) {
    //       for (const node of message.bodyStructure.childNodes){
    //
    //       if( node.type === 'application/vnd.oasis.opendocument.text'){
    //         pj = { messageUid: `${message.uid}` }
    //       }
    //       }
    //     }
    //   }
    // }


      //null permet de récupérer tout l'email
      //@ts-expect-error TS2345
     const downloadObject = await client.download('4767',null, {uid: true})

      const parsed = await simpleParser(downloadObject.content)
      createWriteStream(parsed.attachments[2].filename ?? '').write(parsed.attachments[2].content)
    }
  } catch(e){
    console.error(e)
  }
  finally {
    // Make sure lock is released, otherwise next `getMailboxLock()` never returns
    lock.release();
  }

  // log out and close connection
  await client.logout();
};

run().catch(err => console.error(err));
