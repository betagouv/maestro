import {
  Consumer,
  EachMessagePayload,
  Kafka,
  Partitioners,
  ProducerRecord
} from 'kafkajs';
import config, { KafkaTopic } from '../utils/config';
import { Xml } from './ediSacha/sachaToXML';

let kafka: Kafka | null = null;

if (config.kafka.url) {
  kafka = new Kafka({
    clientId: 'client-id',
    brokers: [config.kafka.url]
  });
} else {
  console.warn(
    "Impossible d'initialiser Kafka car les variables KAFKA ne sont pas définies"
  );
}

export const createConsumer = async (): Promise<Consumer | null> => {
  if (!kafka || !config.kafka.topicRAI) {
    console.warn("Kakfa n'est pas configuré pour recevoir les RAI.");
    return null;
  }
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

export const sendMessage = async (
  message: Xml,
  topic: KafkaTopic | null
): Promise<void> => {
  if (!kafka || !topic) {
    console.warn("Kakfa n'est pas configuré.");
    return;
  }
  const producer = kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner
  });

  const topicMessages: ProducerRecord = {
    topic,
    messages: [{ value: message }]
  };
  await producer.connect();
  await producer.send(topicMessages);
  await producer.disconnect();
};
