import { connect, NatsConnection, JetStreamClient, ConnectionOptions } from "nats";
import { createStream } from "@mint1312-flight-booking/common";

class NatsWrapper {
  private _nc?: NatsConnection;

  get nc(): NatsConnection {
    if (!this._nc) {
      throw new Error("Cannot access NATS client before connecting");
    }
    return this._nc;
  }

  async connect(url: string): Promise<void> {
    this._nc = await connect({ servers: url });

    await createStream(this._nc);

    console.log("Connected to NATS JetStream");

    this._nc.closed().then((err) => {
      if (err) {
        console.error("NATS connection closed with error:", err);
      } else {
        console.log("NATS connection closed");
      }
    });
  }
}

export const natsWrapper = new NatsWrapper();