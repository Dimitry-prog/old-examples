import { Pagination } from "./pagination";
import { usePagination } from "./usePagination";

// Example: Paginating sections/cards
type Section = {
	id: number;
	title: string;
	content: string;
};

const mockSections: Section[] = Array.from({ length: 50 }, (_, i) => ({
	id: i + 1,
	title: `Section ${i + 1}`,
	content: `Content for section ${i + 1}`,
}));

export function SectionsPaginationExample() {
	// Get current pagination state from URL
	const { skip, take } = usePagination({
		name: "sections",
		pageSize: 5,
	});

	// Slice data based on pagination
	const visibleSections = mockSections.slice(skip, skip + take);

	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold">Sections with Pagination</h2>

			{/* Render your sections */}
			<div className="space-y-4">
				{visibleSections.map((section) => (
					<div
						key={section.id}
						className="p-4 border rounded-lg bg-white shadow"
					>
						<h3 className="text-lg font-semibold">{section.title}</h3>
						<p className="text-gray-600">{section.content}</p>
					</div>
				))}
			</div>

			{/* Pagination controls */}
			<Pagination
				name="sections"
				totalItems={mockSections.length}
				pageSize={5}
				pageSizeOptions={[5, 10, 20]}
			/>
		</div>
	);
}

// Example: Paginating cards
type Card = {
	id: number;
	title: string;
	image: string;
};

const mockCards: Card[] = Array.from({ length: 100 }, (_, i) => ({
	id: i + 1,
	title: `Card ${i + 1}`,
	image: `https://via.placeholder.com/300x200?text=Card+${i + 1}`,
}));

export function CardsPaginationExample() {
	const { skip, take } = usePagination({
		name: "cards",
		pageSize: 12,
	});

	const visibleCards = mockCards.slice(skip, skip + take);

	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold">Cards with Pagination</h2>

			{/* Grid of cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{visibleCards.map((card) => (
					<div
						key={card.id}
						className="border rounded-lg overflow-hidden shadow"
					>
						<img
							src={card.image}
							alt={card.title}
							className="w-full h-48 object-cover"
						/>
						<div className="p-4">
							<h3 className="font-semibold">{card.title}</h3>
						</div>
					</div>
				))}
			</div>

			{/* Pagination controls */}
			<Pagination
				name="cards"
				totalItems={mockCards.length}
				pageSize={12}
				pageSizeOptions={[12, 24, 48]}
			/>
		</div>
	);
}

// Example: Server-side pagination
export function ServerSidePaginationExample() {
	const { skip, take, currentPage } = usePagination({
		name: "server-data",
		pageSize: 10,
	});

	// In real app, you would fetch data here
	// const { data, isLoading } = useQuery({
	//   queryKey: ['items', skip, take],
	//   queryFn: () => fetchItems({ skip, take })
	// });

	console.log("Fetch data with:", { skip, take, currentPage });

	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold">Server-side Pagination</h2>

			<div className="p-4 bg-gray-100 rounded">
				<p>Current page: {currentPage}</p>
				<p>Skip: {skip}</p>
				<p>Take: {take}</p>
			</div>

			{/* Your content here */}

			<Pagination
				name="server-data"
				totalItems={500} // Total from server
				pageSize={10}
				onPageChange={(page, pageSize) => {
					console.log("Page changed:", { page, pageSize });
					// Trigger data refetch
				}}
			/>
		</div>
	);
}
