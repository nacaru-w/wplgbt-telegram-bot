export function adaptToMarkdownV2(input: string): string {
    const specialCharacters = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
    let escapedString = '';
    let i = 0;

    const isSpecialCharacter = (char: string) => specialCharacters.includes(char);

    while (i < input.length) {
        if (input[i] === '[') {
            // Start of a potential markdown link
            const endLinkTextIndex = input.indexOf(']', i);
            const startUrlIndex = endLinkTextIndex !== -1 ? input.indexOf('(', endLinkTextIndex) : -1;
            const endUrlIndex = startUrlIndex !== -1 ? input.indexOf(')', startUrlIndex) : -1;

            if (endLinkTextIndex !== -1 && startUrlIndex === endLinkTextIndex + 1 && endUrlIndex !== -1) {
                // Add the opening '['
                escapedString += '[';
                i++;

                // Escape special characters in the link text
                while (i < endLinkTextIndex) {
                    if (isSpecialCharacter(input[i])) {
                        escapedString += '\\' + input[i];
                    } else {
                        escapedString += input[i];
                    }
                    i++;
                }

                // Add the closing ']' and the URL part without escaping
                escapedString += ']' + input.slice(startUrlIndex, endUrlIndex + 1);
                i = endUrlIndex + 1;
                continue;
            }
        }

        if (input[i] === '`') {
            // Inline code block
            const endInlineCodeIndex = input.indexOf('`', i + 1);
            if (endInlineCodeIndex !== -1) {
                escapedString += input.slice(i, endInlineCodeIndex + 1);
                i = endInlineCodeIndex + 1;
                continue;
            }
        }

        const formattingTokens = ['**', '__', '~~', '||', '*', '_', '~'];
        let tokenDetected = false;

        for (const token of formattingTokens) {
            if (input.startsWith(token, i)) {
                const endIndex = input.indexOf(token, i + token.length);
                if (endIndex !== -1) {
                    escapedString += input.slice(i, endIndex + token.length);
                    i = endIndex + token.length;
                    tokenDetected = true;
                    break;
                }
            }
        }

        if (tokenDetected) {
            continue;
        }

        // Escape special characters outside markdown links and formatting
        if (isSpecialCharacter(input[i])) {
            escapedString += '\\' + input[i];
        } else {
            escapedString += input[i];
        }
        i++;
    }

    return escapedString;
}