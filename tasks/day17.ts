import { parse } from '../util/parse';

class Computer {
    dA: number;
    dB: number;
    dC: number;

    commands: number[];
    out: number[] = [];
    instructionPointer: number = 0;

    instructions = [
        (operand: number) => {
            //adv
            this.dA = this.dA >> this.comboOperands[operand]();

            return true;
        },
        (operand: number) => {
            //bxl
            this.dB = this.dB ^ operand;

            return true;
        },
        (operand: number) => {
            //bst
            this.dB = this.comboOperands[operand]() % 8;

            return true;
        },
        (operand: number) => {
            //jnz
            if (this.dA != 0) {
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
            this.out.push(this.comboOperands[operand]() % 8);

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
        () => 0,
        () => 1,
        () => 2,
        () => 3,
        () => this.dA,
        () => this.dB,
        () => this.dC
    ];

    constructor(a: number, b: number, c: number, commands: number[]) {
        this.dA = a;
        this.dB = b;
        this.dC = c;

        this.commands = commands;
    }

    exec() {
        const instruction = this.commands[this.instructionPointer];
        const operand = this.commands[this.instructionPointer + 1];

        if (this.instructions[instruction](operand))
            this.instructionPointer += 2;

        if (this.instructionPointer + 1 >= this.commands.length) return false;

        return true;
    }

    reset(a: number) {
        this.dA = a;
        this.dB = this.dC = 0;
        this.out.length = 0;
        this.instructionPointer = 0;
    }
}

function getData() {
    return parse('tasks\\data\\17.txt', (input) => {
        const [registers, program] = input.trim().split('\r\n\r\n');

        const [a, b, c] = registers
            .split('\r\n')
            .map((x) => Number(x.split(': ')[1]));

        const commands = program
            .split(': ')[1]
            .split(',')
            .map((x) => Number(x));

        return new Computer(a, b, c, commands);
    });
}

export async function pt1() {
    const computer = await getData();
    while (computer.exec());

    return computer.out.join(',');
}

export async function pt2() {
    return;
}