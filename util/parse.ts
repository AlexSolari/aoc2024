export async function parse<TType>(
    path: string,
    transformer: (raw: string) => TType
) {
    const file = Bun.file(path);
    const text = await file.text();

    return transformer(text);
}
