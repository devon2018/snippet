/**
 * Snipp interface
 * 
 * @todo Use createed and last used date for something
 */
export default interface Snipp {
  name: string;
  tags: string[];
  content: string;
  contentType: string;
  created: Date;
  lastUsed: Date;
}