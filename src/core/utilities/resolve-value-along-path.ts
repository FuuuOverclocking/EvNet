/**
 * Resolve the value along the given path on the given object.
 * Return `undefined` when failed, which is like optional chaining.
 * Return an unknown value if the syntax of path is wrong.
 *
 * @example
 * path = 'abc.xyz'
 * return obj.abc.xyz
 * @example
 * path = '.abc.xyz[0]. \n omn '
 * return obj.abc.xyz[0].omn
 * @example
 * path = '["xyz.123\\n"].abc'
 * return obj["xyz.123\n"].abc
 */
export function resolveValueAlongPath(obj: any, path: string): any {
   const nodes: string[] = [];

   let pos = 0; // end position of text of current token
   const end = path.length;

   while (true) {
      skipSpaces();
      if (pos >= end) break;
      const node = parsePropertyAccess();
      nodes.push(node);
   }

   let result: any = obj;
   for (const node of nodes) {
      result = result[node];
      if (result === void 0) return result;
   }
   return result;

   function parsePropertyAccess(): string {
      switch (char()) {
         case '[':
            return parseBracket();
         case '.':
            pos += 1;
         default:
            return parseProperty();
      }
   }

   function skipSpaces(): void {
      while (true) {
         if (pos >= end) return;
         if (isSpace(path.charAt(pos))) pos++;
         else return;
      }
   }

   function isSpace(ch: string): boolean {
      return ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t';
   }

   function char() {
      return path.charAt(pos);
   }

   function parseProperty(): string {
      skipSpaces();
      const startPos = pos;
      while (true) {
         if (pos >= end) break;
         const ch = char();
         if (ch === '.' || ch === '[' || ch === ']' || isSpace(ch)) break;
         pos++;
      }
      return path.substring(startPos, pos);
   }
   function parseBracket(): string {
      pos += 1; // [
      skipSpaces();

      const result =
         char() === `'` || char() === `"` ? parseString() : parseProperty();
      skipSpaces();
      pos += 1; // ]
      return result;
   }
   function parseString(): string {
      const quote = char();
      pos++;
      let result = '';
      let start = pos;

      while (true) {
         // wrong syntax, unterminated string literal
         if (pos >= end) return '';

         if (char() === quote) {
            result += path.substring(start, pos);
            pos++;
            break;
         }

         if (char() === '\\') {
            result += path.substring(start, pos);
            result += scanEscapeSequence();
            start = pos;
            continue;
         }

         // wrong syntax, unterminated string literal
         if (char() === '\n' || char() === '\r') return '';

         pos++;
      }
      return result;
   }
   function scanEscapeSequence(): string {
      pos++;
      if (pos >= end) return ''; // Unexpected end of path

      const ch = path.charAt(pos);
      pos++;
      switch (ch) {
         case '0':
            return '\0';
         case 'b':
            return '\b';
         case 't':
            return '\t';
         case 'n':
            return '\n';
         case 'v':
            return '\v';
         case 'f':
            return '\f';
         case 'r':
            return '\r';
         case `'`:
            return `'`;
         case `"`:
            return `"`;
         default:
            return ''; // Unexpected escape char
      }
   }
}
