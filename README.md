# ZenCure
AI-Powered Naturopathic WebApp 

# Contract

**Name:**  
    queryRemedies(keywords: List<string>): List<Remedy>

**Responsibilities:**  
    Query the remedy database using symptom keywords, remove duplicates and redundant entries, and return a ranked list of remedies ordered by relevance (highest to lowest).

**Type:**  
    System

**Cross References:**  
    - Use Case: Input Symptoms and Generate Recommendations  
    - System Function: R3.1 (Remedy Database Query Logic)

**Note:**  
    - **Relevance Ranking**: Remedies are scored based on keyword match frequency, source credibility (e.g., peer-reviewed studies), and recency (newer entries prioritized).  
    - **Deduplication**: Remedies with identical names/descriptions are merged, retaining the entry with the highest relevance score.  
    - **Redundancy Check**: NLP compares remedy descriptions for semantic similarity (>90% similarity triggers removal of the lower-ranked remedy).

**Exceptions:**  
    1. If `keywords` is empty, return an empty list.  
    2. If the database connection fails, log "DatabaseConnectionError" and terminate the query.  
    3. If no remedies match the keywords, return an empty list.

**Output:**  
    A ranked list of remedies (`List<Remedy>`), ordered by relevance.

**Pre-conditions:**  
    1. Valid `keywords` (non-empty list of symptom terms).  
    2. Remedy database is accessible and operational.

**Post-conditions:**  
    1. **Instance Creation**:  
        - A `QueryResult` instance is created to log the search criteria and results.  
    2. **Attribute Modifications**:  
        - `QueryResult.queryKeywords` is set to `keywords`.  
        - Each remedy’s `relevanceScore` attribute is updated based on keyword matches, source credibility, and recency.  
    3. **Association Formation**:  
        - The `QueryResult` is linked to the current user session.  
        - Each remedy is associated with its `Source` objects (e.g., studies, articles).  
    4. **Data Integrity**:  
        - Duplicate remedies (identical `name`/`description`) are merged, retaining the version with the highest `relevanceScore`.  
        - Redundant remedies (semantically similar) are flagged, and only the highest-ranked entry is included.
