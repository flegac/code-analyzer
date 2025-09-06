from dataclasses import dataclass, field


@dataclass
class StackContext[T]:
    stack: list[T] = field(default_factory=list)

    def push(self, item: T):
        self.stack.append(item)

    def pop(self):
        return self.stack.pop()

    @property
    def current(self):
        if not self.stack:
            return None
        return self.stack[-1]

    def __len__(self):
        return len(self.stack)
