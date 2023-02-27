import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type chatDocument = Chat & Document;

@Schema({ strict: false, autoIndex: true, timestamps: true })
export class Chat {
  @Prop()
  id: string;

  @Prop()
  type: string;

  @Prop()
  fromId: string;

  @Prop()
  fromName: string;

  @Prop()
  sendTime: Date;

  @Prop()
  toId: string;

  @Prop()
  toName: string;

  @Prop()
  text: string;

  @Prop()
  caption: string;

  @Prop()
  roomId: string;

  @Prop()
  originality: string;

  @Prop({ required: false })
  attachment: string;

  @Prop({ required: false })
  thumbnail: string;

  @Prop({ required: false })
  originalId: string;

  @Prop({ required: false })
  originalMessage: string;

  @Prop({ required: false })
  size: string;

  @Prop({ required: false })
  mime: string;

  @Prop({ required: false })
  longitude: string;

  @Prop([String])
  participant: string[];

  @Prop()
  isGroup: number;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
ChatSchema.index({
  id: 1,
  fromId: 1,
}, { unique: true });
