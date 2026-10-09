import { NatsConnection, RetentionPolicy, StorageType } from "nats"
import { Subjects } from "../subjects"
import { streamName } from "./stream-name"

export async function createStream(nc: NatsConnection) {
  const jsm = await nc.jetstreamManager()
  try {
    await jsm.streams.info(streamName)
  } catch {
    await jsm.streams.add({
      name: streamName,
      subjects: Object.values(Subjects),
      retention: RetentionPolicy.Limits,
      storage: StorageType.File,
    })
  }
}