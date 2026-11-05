import ts from 'typescript';

const patterns = [
 /(?<!\d)\d{3}[-.\s]?\d{3}[-.\s]?\d{4}(?!\d)/,
 /\b\d{1,6}\s+(?:[A-Za-z]+\s+){1,5}(?:Street|St\b|Avenue|Ave\b|Road|Rd\b|Drive|Lane|Boulevard|Blvd|Apartment|Apt\b)/i,
 /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
 /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/,
 /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];

/** Ignore only known generated syntax, never globally whitelist a number. */
export function privacyViolation(path: string, input: string): boolean {
 const normalized=path.replaceAll('\\','/'); let text=input;
 if(normalized.startsWith('.next/static/')&&normalized.endsWith('.css')) {
  // Track comments and strings so a copied declaration inside either still gets scanned.
  const literal=new Uint8Array(text.length);let quote='',comment=false;
  for(let i=0;i<text.length;i++) {
   if(comment){literal[i]=1;if(text[i]==='*'&&text[i+1]==='/'){literal[++i]=1;comment=false;}continue;}
   if(quote){literal[i]=1;if(text[i]==='\\'){if(i+1<text.length)literal[++i]=1;}else if(text[i]===quote)quote='';continue;}
   if(text[i]==='/'&&text[i+1]==='*'){literal[i]=literal[++i]=1;comment=true;}
   else if(text[i]==='"'||text[i]==="'"){quote=text[i];literal[i]=1;}
  }
  // A zero-width rule boundary permits adjacent minified rules without consuming
  // the preceding closing brace. Extra declarations (including custom props) fail closed.
  text=text.replace(/((?:^|(?<=[{}]))\s*\.rounded-full\s*\{\s*border-radius\s*:\s*)2147483647(px\s*;?\s*\})/g,(match,prefix,suffix,offset:number)=>{
   const position=offset+prefix.length;
   return literal[position]?match:prefix+'FRAMEWORK_RADIUS'+suffix;
  });
 }
 if(normalized.startsWith('.next/static/')&&normalized.endsWith('.js')) {
  // AST-aware replacement cannot exempt a phone inside a comment or unrelated string/URL.
  const source=ts.createSourceFile(path,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
  const ranges: [number,number][]=[];
  const visit=(node:ts.Node)=>{
   const parent=node.parent;
   if(ts.isNumericLiteral(node)&&node.text==='4294967295'&&ts.isConditionalExpression(parent)&&parent.whenTrue===node&&/^void 0===([\w$]+)$/.test(parent.condition.getText(source))) {
    const identifier=parent.condition.getText(source).split('===')[1];
    if(parent.whenFalse.getText(source)===identifier+'>>>0')ranges.push([node.getStart(source),node.end]);
   }
   if(ts.isNumericLiteral(node)&&node.text==='2147483647'&&ts.isVariableDeclaration(parent)&&parent.initializer===node&&ts.isVariableDeclarationList(parent.parent)) {
    const declarations=parent.parent.declarations,index=declarations.indexOf(parent);
    if(declarations[index+1]?.initializer?.getText(source)==='/[^\\0-\\u007E]/')ranges.push([node.getStart(source),node.end]);
   }
   if(ts.isStringLiteral(node)&&node.text==='0123456789'&&ts.isBinaryExpression(parent)&&parent.left===node&&parent.operatorToken.kind===ts.SyntaxKind.ExclamationEqualsEqualsToken&&parent.right.getText(source).startsWith('Object.getOwnPropertyNames(')&&parent.right.getText(source).includes('.map('))ranges.push([node.getStart(source),node.end]);
   ts.forEachChild(node,visit);
  };visit(source);
  for(const [start,end] of ranges.sort((a,b)=>b[0]-a[0]))text=text.slice(0,start)+'FRAMEWORK_CONSTANT'+text.slice(end);
 }
 return patterns.some(pattern=>pattern.test(text));
}
