import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Helper function to get auth token from localStorage/sessionStorage
const getToken = () => {
	try { 
        return localStorage.getItem('token') || sessionStorage.getItem('token'); 
    } catch { 
        return null; 
    }
};

// Reviews component for a single product
// Props: productId (string)
export default function Review({ productId }) {
	const { user } = useAuth(); // Get current logged-in user from context

	// States
	const [reviews, setReviews] = useState([]); // List of reviews for the product
	const [loading, setLoading] = useState(true); // Loading indicator for reviews fetch
	const [canReview, setCanReview] = useState(false); // If current user can leave a review
	const [submitting, setSubmitting] = useState(false); // Submission/loading indicator
	const [error, setError] = useState(''); // Error messages
	const [form, setForm] = useState({ rating: 5, comment: '' }); // Form state for new/edit review
	const [myReview, setMyReview] = useState(null); // Current user's review (if exists)
	const [editing, setEditing] = useState(false); // Editing mode flag
	const [page, setPage] = useState(1); // Pagination: current page
	const [pages, setPages] = useState(1); // Pagination: total pages
	const [total, setTotal] = useState(0); // Pagination: total reviews
	const [limit] = useState(5); // Reviews per page

	// Base API URL
	const baseUrl = useMemo(() => process.env.REACT_APP_API_URL || 'http://localhost:5000', []);

	// Load reviews whenever productId, page, or limit changes
	useEffect(() => {
		let active = true;
		async function load() {
			setLoading(true);
			try {
				const res = await fetch(`${baseUrl}/api/reviews?productId=${productId}&page=${page}&limit=${limit}`);
				const data = await res.json();
				if (!active) return;
				if (data && Array.isArray(data.reviews)) {
					setReviews(data.reviews); // Set fetched reviews
					setPages(data.pages || 1); // Set total pages
					setTotal(data.total || 0); // Set total review count
				}
			} catch (e) {
				if (active) setError('Failed to load reviews');
			} finally {
				if (active) setLoading(false);
			}
		}
		if (productId) load();
		return () => { active = false; }; // Cleanup to avoid memory leaks
	}, [baseUrl, productId, page, limit]);

	// Check if the user is eligible to leave a review (must have purchased product)
	useEffect(() => {
		let active = true;
		async function check() {
			if (!user) { setCanReview(false); return; }
			const token = getToken();
			if (!token) { setCanReview(false); return; }
			try {
				const res = await fetch(`${baseUrl}/api/orders/my`, {
					headers: { Authorization: `Bearer ${token}` }
				});
				if (!res.ok) { setCanReview(false); return; }
				const orders = await res.json();
				if (!active) return;
				// Check if any order contains this product
				const bought = Array.isArray(orders) && orders.some(o =>
					Array.isArray(o.items) && o.items.some(it => it.product && (it.product._id ? it.product._id : it.product) === productId)
				);
				setCanReview(!!bought);
			} catch {
				if (active) setCanReview(false);
			}
		}
		check();
		return () => { active = false; };
	}, [baseUrl, productId, user]);

	// Load current user's review separately (for editing/deleting)
	useEffect(() => {
		let active = true;
		async function loadMine() {
			if (!user) { setMyReview(null); return; }
			try {
				const res = await fetch(`${baseUrl}/api/reviews?productId=${productId}&userId=${user.id || user._id}&limit=1&page=1`);
				const data = await res.json();
				if (!active) return;
				const r = Array.isArray(data.reviews) ? data.reviews[0] : Array.isArray(data) ? data[0] : null;
				setMyReview(r || null);
				if (r) {
					setForm({ rating: r.rating, comment: r.comment || '' }); // Pre-fill form for edit
					setEditing(true); // Enter edit mode
				} else {
					setEditing(false);
				}
			} catch {
				if (active) setMyReview(null);
			}
		}
		if (productId) loadMine();
		return () => { active = false; };
	}, [baseUrl, productId, user]);

	// Submit a new review or update existing one
	const onSubmit = async (e) => {
		e.preventDefault();
		setError('');
		if (!user) { setError('Please log in to review'); return; }
		if (!canReview) { setError('You can review only after purchasing this product'); return; }
		const token = getToken();
		if (!token) { setError('Session expired. Please log in again.'); return; }
		setSubmitting(true);
		try {
			let url = `${baseUrl}/api/reviews`;
			let method = 'POST';
			if (myReview?._id) {
				url = `${baseUrl}/api/reviews/${myReview._id}`; // Update existing review
				method = 'PUT';
			}
			const res = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({ productId, rating: Number(form.rating), comment: form.comment })
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data?.error || 'Failed to submit review');
			setEditing(false);
			setMyReview(data); // Update user's review state
			setPage(1); // Refresh first page
			// Reload reviews list
			const listRes = await fetch(`${baseUrl}/api/reviews?productId=${productId}&page=1&limit=${limit}`);
			const listData = await listRes.json();
			if (listData && Array.isArray(listData.reviews)) {
				setReviews(listData.reviews);
				setPages(listData.pages || 1);
				setTotal(listData.total || 0);
			}
		} catch (e) {
			setError(e.message);
		} finally {
			setSubmitting(false);
		}
	};

	// Delete current user's review
	const onDelete = async () => {
		setError('');
		if (!user || !myReview?._id) return;
		const token = getToken();
		if (!token) { setError('Session expired. Please log in again.'); return; }
		try {
			const res = await fetch(`${baseUrl}/api/reviews/${myReview._id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` }
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data?.error || 'Failed to delete review');
			setMyReview(null);
			setForm({ rating: 5, comment: '' });
			setEditing(false);
			// Reload reviews list
			const listRes = await fetch(`${baseUrl}/api/reviews?productId=${productId}&page=${page}&limit=${limit}`);
			const listData = await listRes.json();
			if (listData && Array.isArray(listData.reviews)) {
				setReviews(listData.reviews);
				setPages(listData.pages || 1);
				setTotal(listData.total || 0);
			}
		} catch (e) {
			setError(e.message);
		}
	};

	return (
		<div className="bg-white rounded-2xl shadow-xl max-w-7xl mx-auto mb-8 p-8">
			<h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>

			{/* Loading state */}
			{loading ? (
				<p>Loading reviews...</p>
			) : (
				<div className="space-y-4">
					{/* No reviews message */}
					{reviews.length === 0 ? (
						<p className="text-gray-600">No reviews yet.</p>
					) : (
						// Map and display reviews
						reviews.map(r => (
							<div key={r._id} className="border rounded-lg p-4">
								<div className="flex items-center justify-between mb-2">
									<div className="font-medium">{r.userId?.username || 'User'}</div>
									<div className="text-yellow-500">
										{/* Display star rating */}
										{[...Array(5)].map((_, i) => (
											<span key={i}>{i < (r.rating || 0) ? '★' : '☆'}</span>
										))}
									</div>
								</div>
								{r.comment && <p className="text-gray-700 whitespace-pre-line">{r.comment}</p>}
								<div className="text-xs text-gray-500 mt-1">{new Date(r.createdAt).toLocaleString()}</div>

								{/* Edit/Delete buttons only for current user's review */}
								{user && (r.userId?._id === (user.id || user._id)) && (
									<div className="mt-2 flex gap-2">
										<button
											className="px-3 py-1 text-sm bg-gray-200 rounded"
											onClick={() => {
												setEditing(true);
												setForm({ rating: r.rating, comment: r.comment || '' });
												setMyReview(r);
												window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
											}}
										>Edit</button>
										<button className="px-3 py-1 text-sm bg-red-600 text-white rounded" onClick={onDelete}>Delete</button>
									</div>
								)}
							</div>
						))
					)}

					{/* Pagination controls */}
					{pages > 1 && (
						<div className="flex items-center justify-center gap-3 pt-2">
							<button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50">Prev</button>
							<span className="text-sm">Page {page} of {pages} • {total} reviews</span>
							<button disabled={page>=pages} onClick={() => setPage(p => Math.min(pages, p+1))} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50">Next</button>
						</div>
					)}
				</div>
			)}

			<hr className="my-6" />

			{/* Review form or messages */}
			{!user ? (
				<p className="text-gray-700">Please log in to leave a review.</p>
			) : !canReview ? (
				<p className="text-gray-700">Only customers who purchased this product can leave a review.</p>
			) : (
				<form onSubmit={onSubmit} className="space-y-3">
					{error && <div className="text-red-600 text-sm">{error}</div>}
					<div>
						<label className="block text-sm font-medium mb-1">Rating</label>
						<select
							value={form.rating}
							onChange={e => setForm(prev => ({ ...prev, rating: e.target.value }))}
							className="border rounded p-2"
						>
							{[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Comment (optional)</label>
						<textarea
							value={form.comment}
							onChange={e => setForm(prev => ({ ...prev, comment: e.target.value }))}
							className="w-full border rounded p-2"
							rows={3}
							maxLength={500}
							placeholder="Share your experience..."
						/>
					</div>
					<div className="flex gap-2">
						<button disabled={submitting} className="px-4 py-2 bg-orange-700 text-white rounded-lg">
							{submitting ? (editing ? 'Saving...' : 'Submitting...') : (editing ? 'Save Changes' : 'Submit Review')}
						</button>
						{editing && (
							<button type="button" className="px-4 py-2 bg-gray-200 rounded-lg" onClick={() => { setEditing(false); setForm({ rating: myReview?.rating || 5, comment: myReview?.comment || '' }); }}>Cancel</button>
						)}
					</div>
				</form>
			)}
		</div>
	);
}
