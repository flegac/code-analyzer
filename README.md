# Code Graph vizualisation

## Configuration

```json
{
  "excluded": [
    "typing",
    "my.module.*"
  ]
}
```

The `excluded` attribute accepts the following formats:

- 'a.b.c' : explicit node exclusion
- 'a.b.*' : prefix based node exclusion (all nodes starting with 'a.b' will be discarded)