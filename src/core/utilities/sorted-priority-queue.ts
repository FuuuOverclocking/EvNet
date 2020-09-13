/**
 * An implementation of sorted priority queue.
 * Elements are sorted when inserted, in descending order of priority firstly,
 * then in FIFO.
 */
export class SortedPriorityQueue<E> extends Array<E> {
   // corresponds to the array elements 1 - 1
   public priorities: number[] = [];

   public enqueue(priority: number, element: E): this {
      let i = this.length;

      if (i === 0) {
         this.push(element);
         this.priorities.push(priority);
         return this;
      }

      while (i--) {
         if (this.priorities[i] < priority) {
            if (i === 0) {
               this.unshift(element);
               this.priorities.unshift(priority);
               return this;
            }
         } else {
            this.splice(i + 1, 0, element);
            this.priorities.splice(i + 1, 0, priority);
            return this;
         }
      }

      // Unreachable code, just for avoid TypeScript error.
      return this;
   }

   public dequeue(): E | undefined {
      this.priorities.shift();
      return this.shift();
   }
}
