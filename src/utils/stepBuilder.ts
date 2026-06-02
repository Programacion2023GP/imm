// helpers/stepBuilder.ts

type StepFields = {
  text: string[];
  select: string[];
  toggle: string[];
  number: string[];
  date: string[];
  textarea: string[];
  radio: string[];
  array: string[];
  // si usas más tipos (checkbox, file, etc.) agrégalos aquí
};

type StepConfigs = {
  text: Record<string, any>;
  select: Record<string, any>;
  toggle: Record<string, any>;
  number: Record<string, any>;
  date: Record<string, any>;
  textarea: Record<string, any>;
  radio: Record<string, any>;
  array: Record<string, any>;
};

export function defineStep(stepName: string) {
  let fields: StepFields = {
    text: [],
    select: [],
    toggle: [],
    number: [],
    date: [],
    textarea: [],
    radio: [],
    array: [],
  };
  let configs: StepConfigs = {
    text: {},
    select: {},
    toggle: {},
    number: {},
    date: {},
    textarea: {},
    radio: {},
    array: {},
  };

  const api = {
    text(cfg: Record<string, any>) {
      Object.entries(cfg).forEach(([name, config]) => {
        fields.text.push(name);
        configs.text[name] = config;
      });
      return api;
    },
    select(cfg: Record<string, any>) {
      Object.entries(cfg).forEach(([name, config]) => {
        fields.select.push(name);
        configs.select[name] = config;
      });
      return api;
    },
    toggle(cfg: Record<string, any>) {
      Object.entries(cfg).forEach(([name, config]) => {
        fields.toggle.push(name);
        configs.toggle[name] = config;
      });
      return api;
    },
    number(cfg: Record<string, any>) {
      Object.entries(cfg).forEach(([name, config]) => {
        fields.number.push(name);
        configs.number[name] = config;
      });
      return api;
    },
    date(cfg: Record<string, any>) {
      Object.entries(cfg).forEach(([name, config]) => {
        fields.date.push(name);
        configs.date[name] = config;
      });
      return api;
    },
    textarea(cfg: Record<string, any>) {
      Object.entries(cfg).forEach(([name, config]) => {
        fields.textarea.push(name);
        configs.textarea[name] = config;
      });
      return api;
    },
    radio(cfg: Record<string, any>) {
      Object.entries(cfg).forEach(([name, config]) => {
        fields.radio.push(name);
        configs.radio[name] = config;
      });
      return api;
    },
    array(cfg: Record<string, any>) {
      Object.entries(cfg).forEach(([name, config]) => {
        fields.array.push(name);
        configs.array[name] = config;
      });
      return api;
    },
    build() {
      return { fields, configs };
    },
  };
  return api;
}

export function mergeSteps(steps: ReturnType<typeof defineStep>[]) {
  const allFields: StepFields = {
    text: [],
    select: [],
    toggle: [],
    number: [],
    date: [],
    textarea: [],
    radio: [],
    array: [],
  };
  const allConfigs: StepConfigs = {
    text: {},
    select: {},
    toggle: {},
    number: {},
    date: {},
    textarea: {},
    radio: {},
    array: {},
  };
  for (const step of steps) {
    const { fields, configs } = step.build();
    for (const type of Object.keys(fields) as (keyof StepFields)[]) {
      allFields[type].push(...fields[type]);
      Object.assign(allConfigs[type], configs[type]);
    }
  }
  return { fields: allFields, configs: allConfigs };
}
