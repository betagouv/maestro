import {
  Consumer,
  EachMessagePayload,
  Kafka,
  Partitioners,
  ProducerRecord
} from 'kafkajs';
import config from '../utils/config';
import { Xml } from './ediSacha/sachaToXML';

const kafka = new Kafka({
  clientId: 'client-id',
  brokers: [config.kafka.url]
});

export const createConsumer = async (): Promise<Consumer> => {
  const consumer = kafka.consumer({
    groupId: 'consumer-group'
  });

  try {
    await consumer.connect();
    await consumer.subscribe({
      topic: config.kafka.topicRAI
    });

    await consumer.run({
      eachMessage: async (messagePayload: EachMessagePayload) => {
        const { topic, partition, message } = messagePayload;
        const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
        console.log(`- ${prefix} ${message.key}#${message.value}`);
      }
    });
  } catch (error) {
    console.log('Error: ', error);
  }

  return consumer;
};

export const sendMessage = async (message: Xml): Promise<void> => {
  const producer = kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner
  });

  const topicMessages: ProducerRecord = {
    topic: config.kafka.topicDAI,
    messages: [{ value: message }]
  };
  await producer.connect();
  await producer.send(topicMessages);
  await producer.disconnect();
};
