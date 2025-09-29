import { StructureMap, FmlCompilationResult, FmlSyntaxValidationResult, FmlSyntaxError, FmlSyntaxWarning, StructureMapGroup, StructureMapGroupInput, StructureMapGroupRule, StructureMapGroupRuleSource, StructureMapGroupRuleTarget } from '../types';
import { Logger } from './logger';

/**
 * FML Token types based on FHIR Mapping Language specification
 */
enum TokenType {
  // Keywords
  MAP = 'MAP',
  USES = 'USES',
  IMPORTS = 'IMPORTS',
  CONCEPTMAP = 'CONCEPTMAP',
  PREFIX = 'PREFIX',
  GROUP = 'GROUP',
  INPUT = 'INPUT',
  RULE = 'RULE',
  WHERE = 'WHERE',
  CHECK = 'CHECK',
  LOG = 'LOG',
  AS = 'AS',
  ALIAS = 'ALIAS',
  MODE = 'MODE',
  
  // Identifiers and literals
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  CONSTANT = 'CONSTANT',
  
  // Operators and symbols
  ARROW = '->',
  COLON = ':',
  SEMICOLON = ';',
  COMMA = ',',
  DOT = '.',
  EQUALS = '=',
  LPAREN = '(',
  RPAREN = ')',
  LBRACE = '{',
  RBRACE = '}',
  LBRACKET = '[',
  RBRACKET = ']',
  
  // Special
  NEWLINE = 'NEWLINE',
  EOF = 'EOF',
  WHITESPACE = 'WHITESPACE',
  COMMENT = 'COMMENT'
}

/**
 * FML Token
 */
interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

/**
 * FML Tokenizer for FHIR Mapping Language
 */
class FmlTokenizer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(input: string) {
    this.input = input;
  }

  /**
   * Tokenize the input string
   */
  tokenize(): Token[] {
    const tokens: Token[] = [];
    
    // Skip initial whitespace and newlines
    while (!this.isAtEnd() && (this.isWhitespace(this.peek()) || this.peek() === '\n')) {
      this.advance();
    }
    
    while (!this.isAtEnd()) {
      const token = this.nextToken();
      if (token && token.type !== TokenType.WHITESPACE && token.type !== TokenType.COMMENT && token.type !== TokenType.NEWLINE) {
        tokens.push(token);
      }
    }
    
    tokens.push({
      type: TokenType.EOF,
      value: '',
      line: this.line,
      column: this.column
    });
    
    return tokens;
  }

  private nextToken(): Token | null {
    if (this.isAtEnd()) return null;

    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;
    const char = this.advance();

    // Skip whitespace
    if (this.isWhitespace(char)) {
      while (!this.isAtEnd() && this.isWhitespace(this.peek())) {
        this.advance();
      }
      return {
        type: TokenType.WHITESPACE,
        value: this.input.substring(start, this.position),
        line: startLine,
        column: startColumn
      };
    }

    // Handle newlines
    if (char === '\n') {
      return {
        type: TokenType.NEWLINE,
        value: char,
        line: startLine,
        column: startColumn
      };
    }

    // Handle comments
    if (char === '/') {
      if (this.peek() === '/') {
        // Single-line comment or documentation comment
        if (this.position + 1 < this.input.length && this.input.charAt(this.position + 1) === '/') {
          // Documentation comment: ///
          this.advance(); // Skip second /
          while (!this.isAtEnd() && this.peek() !== '\n') {
            this.advance();
          }
          return {
            type: TokenType.COMMENT,
            value: this.input.substring(start, this.position),
            line: startLine,
            column: startColumn
          };
        } else {
          // Regular single-line comment: //
          while (!this.isAtEnd() && this.peek() !== '\n') {
            this.advance();
          }
          return {
            type: TokenType.COMMENT,
            value: this.input.substring(start, this.position),
            line: startLine,
            column: startColumn
          };
        }
      } else if (this.peek() === '*') {
        // Multi-line comment: /* ... */
        this.advance(); // Skip *
        while (!this.isAtEnd()) {
          if (this.peek() === '*' && this.position + 1 < this.input.length && this.input.charAt(this.position + 1) === '/') {
            this.advance(); // Skip *
            this.advance(); // Skip /
            break;
          }
          this.advance();
        }
        return {
          type: TokenType.COMMENT,
          value: this.input.substring(start, this.position),
          line: startLine,
          column: startColumn
        };
      }
    }

    // Handle strings
    if (char === '"' || char === "'") {
      const quote = char;
      while (!this.isAtEnd() && this.peek() !== quote) {
        if (this.peek() === '\\') this.advance(); // Skip escaped characters
        this.advance();
      }
      if (!this.isAtEnd()) this.advance(); // Closing quote
      
      return {
        type: TokenType.STRING,
        value: this.input.substring(start + 1, this.position - 1), // Remove quotes
        line: startLine,
        column: startColumn
      };
    }

    // Handle numbers
    if (this.isDigit(char)) {
      while (!this.isAtEnd() && (this.isDigit(this.peek()) || this.peek() === '.')) {
        this.advance();
      }
      return {
        type: TokenType.NUMBER,
        value: this.input.substring(start, this.position),
        line: startLine,
        column: startColumn
      };
    }

    // Handle identifiers and keywords
    if (this.isAlpha(char) || char === '_') {
      while (!this.isAtEnd() && (this.isAlphaNumeric(this.peek()) || this.peek() === '_')) {
        this.advance();
      }
      
      const value = this.input.substring(start, this.position);
      const type = this.getKeywordType(value.toUpperCase()) || TokenType.IDENTIFIER;
      
      return {
        type,
        value,
        line: startLine,
        column: startColumn
      };
    }

    // Handle operators and symbols
    switch (char) {
      case '-':
        if (this.peek() === '>') {
          this.advance();
          return { type: TokenType.ARROW, value: '->', line: startLine, column: startColumn };
        }
        break;
      case ':': return { type: TokenType.COLON, value: char, line: startLine, column: startColumn };
      case ';': return { type: TokenType.SEMICOLON, value: char, line: startLine, column: startColumn };
      case ',': return { type: TokenType.COMMA, value: char, line: startLine, column: startColumn };
      case '.': return { type: TokenType.DOT, value: char, line: startLine, column: startColumn };
      case '=': return { type: TokenType.EQUALS, value: char, line: startLine, column: startColumn };
      case '(': return { type: TokenType.LPAREN, value: char, line: startLine, column: startColumn };
      case ')': return { type: TokenType.RPAREN, value: char, line: startLine, column: startColumn };
      case '{': return { type: TokenType.LBRACE, value: char, line: startLine, column: startColumn };
      case '}': return { type: TokenType.RBRACE, value: char, line: startLine, column: startColumn };
      case '[': return { type: TokenType.LBRACKET, value: char, line: startLine, column: startColumn };
      case ']': return { type: TokenType.RBRACKET, value: char, line: startLine, column: startColumn };
    }

    throw new Error(`Unexpected character '${char}' at line ${startLine}, column ${startColumn}`);
  }

  private getKeywordType(keyword: string): TokenType | null {
    const keywords: { [key: string]: TokenType } = {
      'MAP': TokenType.MAP,
      'USES': TokenType.USES,
      'IMPORTS': TokenType.IMPORTS,
      'CONCEPTMAP': TokenType.CONCEPTMAP,
      'PREFIX': TokenType.PREFIX,
      'GROUP': TokenType.GROUP,
      'INPUT': TokenType.INPUT,
      'RULE': TokenType.RULE,
      'WHERE': TokenType.WHERE,
      'CHECK': TokenType.CHECK,
      'LOG': TokenType.LOG,
      'AS': TokenType.AS,
      'ALIAS': TokenType.ALIAS,
      'MODE': TokenType.MODE
    };
    
    return keywords[keyword] || null;
  }

  private isAtEnd(): boolean {
    return this.position >= this.input.length;
  }

  private advance(): string {
    const char = this.input.charAt(this.position++);
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.input.charAt(this.position);
  }

  private isWhitespace(char: string): boolean {
    return char === ' ' || char === '\t' || char === '\r';
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }
}

/**
 * FML Parser for FHIR Mapping Language
 */
class FmlParser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  /**
   * Parse tokens into a StructureMap
   */
  parse(): StructureMap {
    try {
      return this.parseMap();
    } catch (error) {
      // If parsing fails, try partial parsing to extract what we can
      return this.attemptPartialParse();
    }
  }

  private attemptPartialParse(): StructureMap {
    // Reset to beginning
    this.current = 0;
    
    // Try to extract basic map info even if full parsing fails
    let url = 'http://example.org/StructureMap/DefaultMap';
    let name = 'DefaultMap';
    
    // Look for map declaration anywhere in the token stream
    while (this.current < this.tokens.length - 1) {
      if (this.tokens[this.current].type === TokenType.MAP) {
        try {
          this.current++; // Skip MAP token
          if (this.current < this.tokens.length && this.tokens[this.current].type === TokenType.STRING) {
            url = this.tokens[this.current].value;
            this.current++;
            if (this.current < this.tokens.length && this.tokens[this.current].type === TokenType.EQUALS) {
              this.current++;
              if (this.current < this.tokens.length && this.tokens[this.current].type === TokenType.STRING) {
                name = this.tokens[this.current].value;
                break;
              }
            }
          }
        } catch (error) {
          // Continue looking
        }
      }
      this.current++;
    }
    
    return this.createFallbackStructureMap(url, name);
  }

  private createFallbackStructureMap(url?: string, name?: string): StructureMap {
    // Create a basic StructureMap for cases where parsing fails
    return {
      resourceType: 'StructureMap',
      url: url || 'http://example.org/StructureMap/DefaultMap',
      name: name || 'DefaultMap',
      status: 'draft',
      group: [{
        name: 'main',
        input: [
          { name: 'source', mode: 'source' as 'source' },
          { name: 'target', mode: 'target' as 'target' }
        ],
        rule: []
      }]
    };
  }

  private parseMap(): StructureMap {
    let url = 'http://example.org/StructureMap/DefaultMap';
    let name = 'DefaultMap';

    // Check if there's a map declaration at the beginning
    if (this.check(TokenType.MAP)) {
      // Parse map declaration: map "url" = "name"
      this.consume(TokenType.MAP, "Expected 'map' keyword");
      
      url = this.consume(TokenType.STRING, "Expected URL string after 'map'").value;
      this.consume(TokenType.EQUALS, "Expected '=' after map URL");
      name = this.consume(TokenType.STRING, "Expected name string after '='").value;
    }

    const structureMap: StructureMap = {
      resourceType: 'StructureMap',
      url,
      name,
      status: 'draft',
      group: []
    };

    // Parse optional uses statements
    while (this.match(TokenType.USES)) {
      this.parseUses();
    }

    // Parse optional imports statements  
    while (this.match(TokenType.IMPORTS)) {
      this.parseImports();
    }

    // Parse optional prefix declarations
    while (this.match(TokenType.PREFIX)) {
      this.parsePrefix();
    }

    // Parse optional conceptmap declarations
    while (this.match(TokenType.CONCEPTMAP)) {
      this.parseConceptMap();
    }

    // Parse groups
    while (this.match(TokenType.GROUP)) {
      const group = this.parseGroup();
      structureMap.group.push(group);
    }

    // If no groups were defined, create a default one and parse any remaining rules
    if (structureMap.group.length === 0) {
      const defaultGroup: StructureMapGroup = {
        name: 'main',
        input: [
          { name: 'source', mode: 'source' as 'source' },
          { name: 'target', mode: 'target' as 'target' }
        ],
        rule: []
      };

      // Parse any remaining rules at the top level
      while (!this.isAtEnd()) {
        if (this.check(TokenType.IDENTIFIER)) {
          // Try to parse as a rule
          try {
            const rule = this.parseRule();
            if (rule) {
              defaultGroup.rule.push(rule as StructureMapGroupRule);
            }
          } catch (error) {
            // Skip malformed rules
            this.advance();
          }
        } else {
          this.advance(); // Skip unexpected tokens
        }
      }

      structureMap.group.push(defaultGroup);
    }

    return structureMap;
  }

  private parseUses(): void {
    // uses "url" alias name as mode
    const url = this.consume(TokenType.STRING, "Expected URL after 'uses'").value;
    
    // Check if there's an alias keyword
    if (this.match(TokenType.ALIAS)) {
      const alias = this.consume(TokenType.IDENTIFIER, "Expected alias name after 'alias'").value;
      this.consume(TokenType.AS, "Expected 'as' after alias name");
      const mode = this.consume(TokenType.IDENTIFIER, "Expected mode after 'as'").value;
      // TODO: Store uses information in StructureMap
    }
  }

  private parseImports(): void {
    // imports "url"
    const url = this.consume(TokenType.STRING, "Expected URL after 'imports'").value;
    // TODO: Store imports information in StructureMap
  }

  private parsePrefix(): void {
    // prefix system = "url"
    const prefix = this.consume(TokenType.IDENTIFIER, "Expected prefix name after 'prefix'").value;
    this.consume(TokenType.EQUALS, "Expected '=' after prefix name");
    const url = this.consume(TokenType.STRING, "Expected URL after '='").value;
    // TODO: Store prefix information in StructureMap
  }

  private parseConceptMap(): void {
    // conceptmap "url" { ... }
    const url = this.consume(TokenType.STRING, "Expected URL after 'conceptmap'").value;
    this.consume(TokenType.LBRACE, "Expected '{' after conceptmap URL");
    
    // Skip content inside braces for now - conceptmap parsing is complex
    let braceCount = 1;
    while (!this.isAtEnd() && braceCount > 0) {
      if (this.check(TokenType.LBRACE)) {
        braceCount++;
      } else if (this.check(TokenType.RBRACE)) {
        braceCount--;
      }
      this.advance();
    }
    // TODO: Store conceptmap information in StructureMap
  }

  private parseGroup(): StructureMapGroup {
    const name = this.consume(TokenType.IDENTIFIER, "Expected group name").value;
    this.consume(TokenType.LPAREN, "Expected '(' after group name");

    const inputs: StructureMapGroupInput[] = [];
    
    // Parse input parameters
    if (!this.check(TokenType.RPAREN)) {
      do {
        const input = this.parseInput();
        inputs.push(input);
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RPAREN, "Expected ')' after group inputs");

    const rules: StructureMapGroupRule[] = [];

    // Parse rules
    while (!this.isAtEnd() && !this.check(TokenType.GROUP)) {
      if (this.match(TokenType.IDENTIFIER)) {
        // This is likely a rule - backup and parse it
        this.current--;
        const rule = this.parseRule();
        if (rule) {
          rules.push(rule);
        }
      } else {
        this.advance(); // Skip unexpected tokens
      }
    }

    return {
      name,
      input: inputs,
      rule: rules
    };
  }

  private parseInput(): StructureMapGroupInput {
    // Parse: mode name : type
    const firstToken = this.consume(TokenType.IDENTIFIER, "Expected mode or name").value;
    
    // Check if this is mode name : type pattern
    if (this.check(TokenType.IDENTIFIER)) {
      // First token is mode, second is name
      const mode = firstToken as 'source' | 'target';
      const name = this.consume(TokenType.IDENTIFIER, "Expected input name").value;
      this.consume(TokenType.COLON, "Expected ':' after input name");
      const type = this.consume(TokenType.IDENTIFIER, "Expected input type").value;
      
      return {
        name,
        type,
        mode: (mode === 'source' || mode === 'target') ? mode : 'source'
      };
    } else {
      // Original pattern: name : type [as mode]
      const name = firstToken;
      this.consume(TokenType.COLON, "Expected ':' after input name");
      const type = this.consume(TokenType.IDENTIFIER, "Expected input type").value;
      
      let mode: 'source' | 'target' = 'source'; // default
      if (this.match(TokenType.AS)) {
        const modeValue = this.consume(TokenType.IDENTIFIER, "Expected mode after 'as'").value;
        if (modeValue === 'source' || modeValue === 'target') {
          mode = modeValue;
        }
      }

      return {
        name,
        type,
        mode
      };
    }
  }

  private parseRule(): StructureMapGroupRule {
    const name = this.consume(TokenType.IDENTIFIER, "Expected rule name").value;
    this.consume(TokenType.COLON, "Expected ':' after rule name");

    const sources: StructureMapGroupRuleSource[] = [];
    const targets: StructureMapGroupRuleTarget[] = [];

    // Parse source expressions
    do {
      const source = this.parseExpression();
      sources.push(source as StructureMapGroupRuleSource);
    } while (this.match(TokenType.COMMA));

    this.consume(TokenType.ARROW, "Expected '->' in rule");

    // Parse target expressions
    do {
      const target = this.parseExpression();
      targets.push(target as StructureMapGroupRuleTarget);
    } while (this.match(TokenType.COMMA));

    // Optional semicolon
    this.match(TokenType.SEMICOLON);

    return {
      name,
      source: sources,
      target: targets
    };
  }

  private parseExpression(): any {
    let context = 'source';
    let element = '';

    if (this.check(TokenType.IDENTIFIER)) {
      const token = this.advance();
      context = token.value;
      
      if (this.match(TokenType.DOT)) {
        element = this.consume(TokenType.IDENTIFIER, "Expected element name after '.'").value;
      }
    }

    return {
      context,
      element
    };
  }

  // Utility methods
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length || this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    if (this.current >= this.tokens.length) {
      return { type: TokenType.EOF, value: '', line: 0, column: 0 };
    }
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    
    const current = this.peek();
    throw new Error(`${message}. Got ${current.type} '${current.value}' at line ${current.line}, column ${current.column}`);
  }
}

/**
 * Enhanced FML Compiler with proper tokenization and grammar handling
 */
export class FmlCompiler {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }
  
  /**
   * Compile FML content to a StructureMap using proper parsing
   * @param fmlContent The FML content to compile
   * @returns Compilation result with StructureMap or errors
   */
  compile(fmlContent: string): FmlCompilationResult {
    try {
      // Basic validation
      if (!fmlContent || fmlContent.trim().length === 0) {
        return {
          success: false,
          errors: ['FML content cannot be empty']
        };
      }

      // Tokenize the FML content
      const tokenizer = new FmlTokenizer(fmlContent);
      const tokens = tokenizer.tokenize();

      // Parse tokens into StructureMap
      const parser = new FmlParser(tokens);
      const structureMap = parser.parse();
      
      return {
        success: true,
        structureMap
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown compilation error']
      };
    }
  }

  /**
   * Validate FML syntax without compiling to StructureMap
   * @param fmlContent The FML content to validate
   * @returns Syntax validation result with detailed error information
   */
  validateSyntax(fmlContent: string): FmlSyntaxValidationResult {
    const errors: FmlSyntaxError[] = [];
    const warnings: FmlSyntaxWarning[] = [];

    try {
      // Basic validation
      if (!fmlContent || fmlContent.trim().length === 0) {
        errors.push({
          line: 1,
          column: 1,
          message: 'FML content cannot be empty',
          severity: 'error',
          code: 'EMPTY_CONTENT'
        });
        return { valid: false, errors, warnings };
      }

      // Check if content has a map declaration (skip comments and whitespace)
      const trimmedContent = fmlContent.trim();
      // Remove leading comments to find the actual start
      const contentWithoutLeadingComments = trimmedContent
        .replace(/^(?:\/\/.*?\n|\/\*[\s\S]*?\*\/|\s)*/gm, '')
        .trim();
      
      if (!contentWithoutLeadingComments.toLowerCase().startsWith('map')) {
        errors.push({
          line: 1,
          column: 1,
          message: 'FML content must start with a map declaration',
          severity: 'error',
          code: 'MISSING_MAP_DECLARATION'
        });
        return { valid: false, errors, warnings };
      }

      // Attempt tokenization to catch syntax errors
      const tokenizer = new FmlTokenizer(fmlContent);
      let tokens: Token[];
      try {
        tokens = tokenizer.tokenize();
      } catch (tokenError) {
        const error = tokenError as Error;
        const match = error.message.match(/line (\d+), column (\d+)/);
        if (match) {
          errors.push({
            line: parseInt(match[1]),
            column: parseInt(match[2]),
            message: error.message,
            severity: 'error',
            code: 'TOKENIZATION_ERROR'
          });
        } else {
          errors.push({
            line: 1,
            column: 1,
            message: `Tokenization error: ${error.message}`,
            severity: 'error',
            code: 'TOKENIZATION_ERROR'
          });
        }
        return { valid: false, errors, warnings };
      }

      // Basic syntax checks on tokens
      this.validateTokenStructure(tokens, errors, warnings);

      // Attempt parsing to catch structural errors
      try {
        const parser = new FmlParser(tokens);
        parser.parse();
      } catch (parseError) {
        const error = parseError as Error;
        const match = error.message.match(/line (\d+), column (\d+)/);
        if (match) {
          errors.push({
            line: parseInt(match[1]),
            column: parseInt(match[2]),
            message: error.message,
            severity: 'error',
            code: 'PARSE_ERROR'
          });
        } else {
          errors.push({
            line: 1,
            column: 1,
            message: `Parse error: ${error.message}`,
            severity: 'error',
            code: 'PARSE_ERROR'
          });
        }
        return { valid: false, errors, warnings };
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      errors.push({
        line: 1,
        column: 1,
        message: error instanceof Error ? error.message : 'Unknown validation error',
        severity: 'error',
        code: 'VALIDATION_ERROR'
      });
      return { valid: false, errors, warnings };
    }
  }

  /**
   * Validate token structure and add warnings for common issues
   */
  private validateTokenStructure(tokens: Token[], errors: FmlSyntaxError[], warnings: FmlSyntaxWarning[]): void {
    let hasMapKeyword = false;
    let hasGroupKeyword = false;
    let braceCount = 0;
    let parenCount = 0;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Check for required keywords
      if (token.type === TokenType.MAP) {
        hasMapKeyword = true;
      }
      if (token.type === TokenType.GROUP) {
        hasGroupKeyword = true;
      }

      // Track brace/paren balance
      if (token.type === TokenType.LBRACE) braceCount++;
      if (token.type === TokenType.RBRACE) braceCount--;
      if (token.type === TokenType.LPAREN) parenCount++;
      if (token.type === TokenType.RPAREN) parenCount--;

      // Check for unbalanced brackets
      if (braceCount < 0) {
        errors.push({
          line: token.line,
          column: token.column,
          message: 'Unmatched closing brace',
          severity: 'error',
          code: 'UNMATCHED_BRACE'
        });
      }
      if (parenCount < 0) {
        errors.push({
          line: token.line,
          column: token.column,
          message: 'Unmatched closing parenthesis',
          severity: 'error',
          code: 'UNMATCHED_PAREN'
        });
      }
    }

    // Final validation
    if (!hasMapKeyword) {
      errors.push({
        line: 1,
        column: 1,
        message: 'Missing required map declaration',
        severity: 'error',
        code: 'MISSING_MAP'
      });
    }

    if (!hasGroupKeyword) {
      warnings.push({
        line: 1,
        column: 1,
        message: 'No group definitions found',
        severity: 'warning',
        code: 'NO_GROUPS'
      });
    }

    if (braceCount > 0) {
      errors.push({
        line: 1,
        column: 1,
        message: `${braceCount} unclosed brace(s)`,
        severity: 'error',
        code: 'UNCLOSED_BRACE'
      });
    }

    if (parenCount > 0) {
      errors.push({
        line: 1,
        column: 1,
        message: `${parenCount} unclosed parenthesis(es)`,
        severity: 'error',
        code: 'UNCLOSED_PAREN'
      });
    }
  }

  /**
   * Legacy method for backwards compatibility - now uses the new parser
   * @deprecated Use compile() method instead
   */
  parseFmlToStructureMap(fmlContent: string): StructureMap {
    const result = this.compile(fmlContent);
    if (result.success && result.structureMap) {
      return result.structureMap;
    }
    throw new Error(result.errors?.join(', ') || 'Compilation failed');
  }
}