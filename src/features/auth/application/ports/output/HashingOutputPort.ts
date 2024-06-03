export abstract class HashingOutputPort {
  abstract compare(data: string, hashedData: string): Promise<boolean>;
  abstract hash(data: string): Promise<string>;
}
