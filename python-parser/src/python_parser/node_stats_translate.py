import json
from pathlib import Path

projects = {
    'default': "/home/flo/Documents/workspace/organism/src",

    'test-project': "/home/flo/Documents/workspace/organism/src",
    'code-analyzer': "/home/flo/Documents/workspace/code-analyzer/src",
}
class ModuleStats:

    @staticmethod
    def compute_category(ref):
        if '/' in ref:
            return 'Method'
        if "::" in ref:
            last_part = ref.split('::')[-1]
            if last_part.endswith('*'):
                return 'Other'
            if last_part.isupper():
                return 'Constant'
            return 'Class' if last_part[0].isupper() else 'Function'
        return 'Module'


    @staticmethod
    def count_lines(path) -> int:
        with path.open('r', encoding='utf-8') as f:
            return sum(1 for _ in f)

def projection(data:dict, label:str) -> dict:
    return {
        k:v[label]
        for k,v in data.items()
    }

def main():
    name = 'default'
    project_root = Path(projects[name])
    target = Path(__file__).parent.parent.parent / f'resources/projects/{name}'
    print(f'working in: {target.absolute()}')

    node_path = target / 'nodes'
    with (target / 'relation.json').open('r') as _:
        data = json.load(_)
        xxx ={
            k: ModuleStats.compute_category(k)
            for k in data
        }
        print(xxx)
        (node_path/ f'category.json').write_text(json.dumps(xxx, indent=2, sort_keys=True))

if __name__ == "__main__":
    main()
