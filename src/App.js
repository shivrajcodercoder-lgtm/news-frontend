import { useEffect, useState } from "react";
import "@/App.css";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, Building2, Clock } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchNews = async (showToast = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/news`);
      setNews(response.data || []);
      setLastUpdate(new Date());
      if (showToast) {
        toast.success('News updated successfully');
      }
    } catch (e) {
      console.error('Error fetching news:', e);
      toast.error('Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await axios.post(`${API}/news/refresh`);
      setTimeout(() => fetchNews(true), 2000);
    } catch (e) {
      console.error('Error refreshing news:', e);
      toast.error('Failed to refresh news');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Auto-refresh every 10 minutes
    const interval = setInterval(() => fetchNews(true), 20 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Market News
                </h1>
                <p className="text-sm text-slate-600">NSE High Impact Corporate Announcements</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {lastUpdate && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>Updated {lastUpdate.toLocaleTimeString()}</span>
                </div>
              )}
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="refresh-news-btn"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600">Loading news...</p>
            </div>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No announcements available</p>
            <p className="text-slate-500 text-sm mt-2">Check back in a few minutes</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {news.map((item, index) => (
              <Card
                key={item.id || index}
                className="hover:shadow-xl transition-all duration-300 border-slate-200 bg-white/80 backdrop-blur-sm"
                data-testid={`news-card-${index}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 font-semibold"
                          data-testid={`news-source-${index}`}
                        >
                          {item.source}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-700 font-mono"
                          data-testid={`news-symbol-${index}`}
                        >
                          {item.symbol}
                        </Badge>
                        {item.impact && (
                          <Badge
                            variant="outline"
                            className={`font-semibold ${
                              item.impact === 'HIGH'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-orange-50 text-orange-700 border-orange-200'
                            }`}
                            data-testid={`news-impact-${index}`}
                          >
                            {item.impact}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base font-semibold text-slate-800 leading-relaxed" data-testid={`news-headline-${index}`}>
                        {item.headline}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      <span className="font-medium" data-testid={`news-company-${index}`}>{item.company}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span data-testid={`news-time-${index}`}>{formatTime(item.timestamp)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Footer info */}
        {news.length > 0 && (
          <div className="mt-8 text-center text-sm text-slate-500">
            <p>Showing {news.length} announcements • Auto-refreshes every 20 minutes • 48-hour retention</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
