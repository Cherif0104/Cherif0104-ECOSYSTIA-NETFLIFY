import { supabase } from './supabaseService';
import { KnowledgeArticle, KnowledgeCategory } from '../types';

class KnowledgeBaseService {
  private articlesTableName = 'knowledge_articles';
  private categoriesTableName = 'knowledge_categories';

  // ===== ARTICLES =====

  private mapArticleFromSupabase(data: any): KnowledgeArticle {
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      summary: data.summary,
      category: data.category,
      type: data.type,
      status: data.status,
      tags: data.tags || [],
      author: data.author,
      views: data.views || 0,
      rating: data.rating || 0,
      helpful: data.helpful || 0,
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
      updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
      lastViewed: data.last_viewed ? new Date(data.last_viewed) : undefined,
    };
  }

  private mapArticleToSupabase(article: Partial<KnowledgeArticle>): any {
    const data: any = {};
    if (article.title !== undefined) data.title = article.title;
    if (article.content !== undefined) data.content = article.content;
    if (article.summary !== undefined) data.summary = article.summary;
    if (article.category !== undefined) data.category = article.category;
    if (article.type !== undefined) data.type = article.type;
    if (article.status !== undefined) data.status = article.status;
    if (article.tags !== undefined) data.tags = article.tags;
    if (article.author !== undefined) data.author = article.author;
    if (article.views !== undefined) data.views = article.views;
    if (article.rating !== undefined) data.rating = article.rating;
    if (article.helpful !== undefined) data.helpful = article.helpful;
    if (article.lastViewed !== undefined) data.last_viewed = article.lastViewed.toISOString();
    data.updated_at = new Date().toISOString();
    return data;
  }

  async createArticle(articleData: Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeArticle | null> {
    try {
      const supabaseData = this.mapArticleToSupabase(articleData);
      const { data, error } = await supabase
        .from(this.articlesTableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour le compteur d'articles de la catégorie
      if (articleData.category) {
        await this.incrementCategoryArticleCount(articleData.category);
      }

      console.log('✅ Article créé dans Supabase:', data.id);
      return this.mapArticleFromSupabase(data);
    } catch (error: any) {
      console.error('❌ Erreur création article:', error.message);
      throw error;
    }
  }

  async getArticles(userId?: string): Promise<KnowledgeArticle[]> {
    try {
      console.log('🔄 Récupération articles Supabase...');
      
      let query = supabase
        .from(this.articlesTableName)
        .select('*')
        .order('created_at', { ascending: false });

      // Filtrer par utilisateur si fourni
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      console.log(`✅ ${data.length} articles récupérés`);
      return data.map(this.mapArticleFromSupabase);
    } catch (error: any) {
      console.error('❌ Erreur récupération articles:', error.message);
      return [];
    }
  }

  async getAll(userId?: string): Promise<KnowledgeArticle[]> {
    return this.getArticles(userId);
  }

  async getArticleById(id: string): Promise<KnowledgeArticle | null> {
    try {
      const { data, error } = await supabase
        .from(this.articlesTableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Incrémenter le compteur de vues
      await this.incrementArticleViews(id);

      console.log('✅ Article récupéré:', id);
      return this.mapArticleFromSupabase(data);
    } catch (error: any) {
      console.error('❌ Erreur récupération article:', error.message);
      return null;
    }
  }

  async updateArticle(id: string, articleData: Partial<KnowledgeArticle>): Promise<KnowledgeArticle | null> {
    try {
      const supabaseData = this.mapArticleToSupabase(articleData);
      const { data, error } = await supabase
        .from(this.articlesTableName)
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Article mis à jour dans Supabase:', id);
      return this.mapArticleFromSupabase(data);
    } catch (error: any) {
      console.error('❌ Erreur mise à jour article:', error.message);
      throw error;
    }
  }

  async deleteArticle(id: string): Promise<boolean> {
    try {
      const article = await this.getArticleById(id);

      const { error } = await supabase
        .from(this.articlesTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Décrémenter le compteur d'articles de la catégorie
      if (article?.category) {
        await this.decrementCategoryArticleCount(article.category);
      }

      console.log('✅ Article supprimé de Supabase:', id);
      return true;
    } catch (error: any) {
      console.error('❌ Erreur suppression article:', error.message);
      return false;
    }
  }

  async incrementArticleViews(id: string): Promise<void> {
    try {
      const { data: article, error: fetchError } = await supabase
        .from(this.articlesTableName)
        .select('views')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from(this.articlesTableName)
        .update({
          views: (article.views || 0) + 1,
          last_viewed: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('❌ Erreur incrémentation vues:', error.message);
    }
  }

  async rateArticle(id: string, rating: number): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.articlesTableName)
        .update({ 
          rating,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Note article mise à jour');
    } catch (error: any) {
      console.error('❌ Erreur notation article:', error.message);
    }
  }

  async markArticleHelpful(id: string): Promise<void> {
    try {
      const { data: article, error: fetchError } = await supabase
        .from(this.articlesTableName)
        .select('helpful')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from(this.articlesTableName)
        .update({
          helpful: (article.helpful || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Article marqué comme utile');
    } catch (error: any) {
      console.error('❌ Erreur marquage article utile:', error.message);
    }
  }

  // ===== CATEGORIES =====

  private mapCategoryFromSupabase(data: any): KnowledgeCategory {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      color: data.color,
      articleCount: data.article_count || 0,
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    };
  }

  private mapCategoryToSupabase(category: Partial<KnowledgeCategory>): any {
    const data: any = {};
    if (category.name !== undefined) data.name = category.name;
    if (category.description !== undefined) data.description = category.description;
    if (category.color !== undefined) data.color = category.color;
    if (category.articleCount !== undefined) data.article_count = category.articleCount;
    data.updated_at = new Date().toISOString();
    return data;
  }

  async createCategory(categoryData: Omit<KnowledgeCategory, 'id' | 'createdAt'>): Promise<KnowledgeCategory | null> {
    try {
      const supabaseData = this.mapCategoryToSupabase(categoryData);
      const { data, error } = await supabase
        .from(this.categoriesTableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Catégorie créée dans Supabase:', data.id);
      return this.mapCategoryFromSupabase(data);
    } catch (error: any) {
      console.error('❌ Erreur création catégorie:', error.message);
      throw error;
    }
  }

  async getCategories(): Promise<KnowledgeCategory[]> {
    try {
      const { data, error } = await supabase
        .from(this.categoriesTableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log(`✅ ${data.length} catégories récupérées`);
      return data.map(this.mapCategoryFromSupabase);
    } catch (error: any) {
      console.error('❌ Erreur récupération catégories:', error.message);
      return [];
    }
  }

  async updateCategory(id: string, categoryData: Partial<KnowledgeCategory>): Promise<KnowledgeCategory | null> {
    try {
      const supabaseData = this.mapCategoryToSupabase(categoryData);
      const { data, error } = await supabase
        .from(this.categoriesTableName)
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Catégorie mise à jour dans Supabase:', id);
      return this.mapCategoryFromSupabase(data);
    } catch (error: any) {
      console.error('❌ Erreur mise à jour catégorie:', error.message);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.categoriesTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Catégorie supprimée de Supabase:', id);
      return true;
    } catch (error: any) {
      console.error('❌ Erreur suppression catégorie:', error.message);
      return false;
    }
  }

  async incrementCategoryArticleCount(categoryName: string): Promise<void> {
    try {
      const { data: category, error: fetchError } = await supabase
        .from(this.categoriesTableName)
        .select('id, article_count')
        .eq('name', categoryName)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from(this.categoriesTableName)
        .update({
          article_count: (category.article_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', category.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('❌ Erreur incrémentation compteur articles:', error.message);
    }
  }

  async decrementCategoryArticleCount(categoryName: string): Promise<void> {
    try {
      const { data: category, error: fetchError } = await supabase
        .from(this.categoriesTableName)
        .select('id, article_count')
        .eq('name', categoryName)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from(this.categoriesTableName)
        .update({
          article_count: Math.max(0, (category.article_count || 0) - 1),
          updated_at: new Date().toISOString()
        })
        .eq('id', category.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('❌ Erreur décrémentation compteur articles:', error.message);
    }
  }

  // ===== SEARCH AND ANALYTICS =====

  async searchArticles(query: string): Promise<KnowledgeArticle[]> {
    try {
      const { data, error } = await supabase
        .from(this.articlesTableName)
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`);

      if (error) throw error;

      console.log(`✅ ${data.length} articles trouvés pour "${query}"`);
      return data.map(this.mapArticleFromSupabase);
    } catch (error: any) {
      console.error('❌ Erreur recherche articles:', error.message);
      return [];
    }
  }

  async getArticlesByCategory(categoryName: string): Promise<KnowledgeArticle[]> {
    try {
      const { data, error } = await supabase
        .from(this.articlesTableName)
        .select('*')
        .eq('category', categoryName);

      if (error) throw error;

      console.log(`✅ ${data.length} articles dans la catégorie "${categoryName}"`);
      return data.map(this.mapArticleFromSupabase);
    } catch (error: any) {
      console.error('❌ Erreur récupération articles par catégorie:', error.message);
      return [];
    }
  }

  async getKnowledgeBaseAnalytics(): Promise<any> {
    try {
      const [articles, categories] = await Promise.all([
        this.getArticles(),
        this.getCategories()
      ]);

      const articlesByStatus = articles.reduce((acc, article) => {
        acc[article.status] = (acc[article.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const articlesByType = articles.reduce((acc, article) => {
        acc[article.type] = (acc[article.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const articlesByCategory = articles.reduce((acc, article) => {
        acc[article.category] = (acc[article.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
      const avgRating = articles.length > 0
        ? articles.reduce((sum, article) => sum + (article.rating || 0), 0) / articles.length
        : 0;

      return {
        totalArticles: articles.length,
        publishedArticles: articles.filter(a => a.status === 'published').length,
        draftArticles: articles.filter(a => a.status === 'draft').length,
        totalCategories: categories.length,
        totalViews,
        avgRating,
        articlesByStatus,
        articlesByType,
        articlesByCategory,
        mostViewedArticles: articles.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5),
        topRatedArticles: articles.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5),
      };
    } catch (error: any) {
      console.error('❌ Erreur calcul analytics base de connaissances:', error.message);
      throw error;
    }
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();