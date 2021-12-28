import {
  CommandHandler,
  useDescription,
  useNumber,
  createElement,
  Message,
} from "slshx";

// `Env` contains bindings and is declared in types/env.d.ts
export function add(): CommandHandler<Env> {
  useDescription("Adds two numbers together");
  const a = useNumber("a", "1st number", { required: true });
  const b = useNumber("b", "2nd number", { required: true });
  return (interaction, env, ctx) => (
    <Message ephemeral>
      {a} + {b} = {a + b}
    </Message>
  );
}
