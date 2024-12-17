import { parse } from '../util/parse';

class Computer {
    dA: bigint;
    dB: bigint;
    dC: bigint;

    commands: bigint[];
    out: bigint[] = [];
    instructionPointer: number = 0;

    instructions = [
        (operand: number) => {
            //adv
            this.dA = this.dA >> this.comboOperands[operand]();

            return true;
        },
        (operand: number) => {
            //bxl
            this.dB = this.dB ^ BigInt(operand);

            return true;
        },
        (operand: number) => {
            //bst
            this.dB = this.comboOperands[operand]() % 8n;

            return true;
        },
        (operand: number) => {
            //jnz
            if (this.dA != 0n) {
                this.instructionPointer = operand;
                return false;
            }

            return true;
        },
        (operand: number) => {
            //bxc
            this.dB = this.dB ^ this.dC;

            return true;
        },
        (operand: number) => {
            //out
            this.out.push(this.comboOperands[operand]() % 8n);

            return true;
        },
        (operand: number) => {
            //bdv
            this.dB = this.dA >> this.comboOperands[operand]();

            return true;
        },
        (operand: number) => {
            //сdv
            this.dC = this.dA >> this.comboOperands[operand]();

            return true;
        }
    ];

    comboOperands = [
        () => 0n,
        () => 1n,
        () => 2n,
        () => 3n,
        () => this.dA,
        () => this.dB,
        () => this.dC
    ];

    constructor(a: bigint, b: bigint, c: bigint, commands: bigint[]) {
        this.dA = a;
        this.dB = b;
        this.dC = c;

        this.commands = commands;
    }

    exec() {
        const instruction = Number(this.commands[this.instructionPointer]);
        const operand = Number(this.commands[this.instructionPointer + 1]);

        if (this.instructions[instruction](operand))
            this.instructionPointer += 2;

        if (this.instructionPointer + 1 >= this.commands.length) return false;

        return true;
    }

    reset(a: bigint) {
        this.dA = a;
        this.dB = this.dC = 0n;
        this.out.length = 0;
        this.instructionPointer = 0;
    }
}

function getData() {
    return parse('tasks\\data\\17.txt', (input) => {
        const [registers, program] = input.trim().split('\r\n\r\n');

        const [a, b, c] = registers
            .split('\r\n')
            .map((x) => BigInt(x.split(': ')[1]));

        const commands = program
            .split(': ')[1]
            .split(',')
            .map((x) => BigInt(x));

        return new Computer(a, b, c, commands);
    });
}
export async function pt1() {
    const computer = await getData();
    while (computer.exec());

    return computer.out.join(',');
}

export async function pt2() {
    const computer = await getData();
    while (computer.exec());

    const program = computer.commands;

    const findA = (next = 0n, i = program.length - 1): bigint => {
        if (i < 0) return next;

        for (let a = next << 3n; a < (next << 3n) + 8n; a++) {
            computer.reset(a);
            while (computer.exec());

            if (computer.out[0] === program[i]) {
                const final = findA(a, i - 1);

                if (final >= 0) return final;
            }
        }

        return -1n;
    };

    return findA();
}
