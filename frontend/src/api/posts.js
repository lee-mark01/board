const API = 'http://localhost:8080/api/posts';

export async function fetchPosts(page = 0, size = 10, keyword = '') {
  const params = new URLSearchParams({ page, size });
  if (keyword) params.set('keyword', keyword);
  const res = await fetch(`${API}?${params}`);
  if (!res.ok) throw new Error('목록을 불러올 수 없습니다.');
  return res.json();
}

export async function fetchPost(id) {
  const res = await fetch(`${API}/${id}`);
  if (!res.ok) throw new Error('게시글을 불러올 수 없습니다.');
  return res.json();
}

export async function createPost(data) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('게시글 작성에 실패했습니다.');
  return res.json();
}

export async function updatePost(data) {
  const res = await fetch(API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('게시글 수정에 실패했습니다.');
  return res.json();
}

export async function deletePost(data) {
  const res = await fetch(API, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('게시글 삭제에 실패했습니다.');
}
