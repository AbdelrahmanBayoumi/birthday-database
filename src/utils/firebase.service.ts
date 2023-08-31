import { Injectable } from '@nestjs/common';
import { firebaseAdmin as admin } from '../config/firebase.config';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FirebaseService {
  private readonly storage = admin.storage().bucket(process.env.BUCKET);

  async uploadImage(image: Express.Multer.File): Promise<string> {
    if (!image) {
      return null;
    }
    const extension = path.extname(image.originalname);
    const filename = `${uuidv4()}${extension}`;
    const fileRef = this.storage.file(filename);
    await fileRef.save(image.buffer, {
      public: true,
      metadata: {
        contentType: image.mimetype,
      },
    });

    return filename;
  }

  // TODO: implement delete image if changed
  // async deleteImage(filename: string): Promise<void> {
  //   const fileRef = this.storage.file(filename);
  //   await fileRef.delete();
  // }
}
