export interface Item {
  id: string;
  name: string;
}

export const CatEars: Item = {
  id: 'cat_ears',
  name: 'Котячі вушка обруч',
};

const AllItems = [CatEars];

export function getItemById(id: string): Item | undefined {
  return AllItems.find(item => item.id === id);
}
