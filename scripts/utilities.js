/**
 * e.g. `node ./example.js build --abc edf -g -hi jkl`
 * ```
 * > parseCommandLineArguments({
 *       allowedCommands: ['build'],
 *       booleanOptions: ['g', 'h', 'i'],
 *   });
 *
 * {
 *     commands: ['build'],
 *     options: {
 *         abc: 'edf',
 *         g: undefined,
 *         h: undefined,
 *         i: undefined
 *     },
 *     content: 'jkl'
 * }
 * ```
 */
function parseCommandLineArguments(setting) {
    const argv = process.argv.slice(2);

    setting = setting || {};
    const allowedCommands = setting.allowedCommands || [];
    const booleanOptions = setting.booleanOptions || [];

    const result = {
        commands: [],
        options: {},
        content: undefined,
    };

    let isCommandPartOver = false;
    let nextArgCanBeValueOfOption = false;
    for (const arg of argv) {
        if (!isCommandPartOver && ~allowedCommands.indexOf(arg)) {
            result.commands.push(arg);
            continue;
        }
        isCommandPartOver = true;

        if (arg.charAt(0) === '-' && arg !== '-' && arg !== '--') {
            if (nextArgCanBeValueOfOption) {
                result.options[nextArgCanBeValueOfOption] = undefined;
            }

            if (arg.charAt(1) === '-') {
                // --abc : an option named `abc`
                const option = arg.substr(2);
                if (!~booleanOptions.indexOf(option)) {
                    nextArgCanBeValueOfOption = option;
                } else {
                    nextArgCanBeValueOfOption = false;
                    result.options[option] = undefined;
                }
            } else {
                // -abc : three arguments ['a', 'b', 'c']
                if (arg.length === 2 && !~booleanOptions.indexOf(arg.charAt(1))) {
                    nextArgCanBeValueOfOption = arg.charAt(1);
                } else {
                    nextArgCanBeValueOfOption = false;
                    arg.substr(1).split('').forEach(option => {
                        result.options[option] = undefined;
                    });
                }
            }

            continue;
        }

        if (nextArgCanBeValueOfOption) {
            result.options[nextArgCanBeValueOfOption] = arg;
        } else {
            result.content = arg;
        }
    }

    return result;
}

exports.parseCommandLineArguments = parseCommandLineArguments;