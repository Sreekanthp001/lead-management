import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Calendar, ListChecks, AlertCircle, Clock, ArrowUpRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Never Miss a Lead Follow-up
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A personal lead management system built for LinkedIn-first workflows. 
            Discipline-driven. Zero missed opportunities.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/dashboard">
                View Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link to="/create">
                Create Lead
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="container py-16 border-t">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-12 text-foreground">
            Core Principles
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-card border shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                <ListChecks className="h-5 w-5 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Structured Lead Creation
              </h3>
              <p className="text-sm text-muted-foreground">
                Every lead requires a LinkedIn profile and a next action. No incomplete entries allowed.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                <Calendar className="h-5 w-5 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Follow-up-First Workflow
              </h3>
              <p className="text-sm text-muted-foreground">
                Your dashboard is organized by follow-up urgency. Overdue items are impossible to ignore.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                <CheckCircle className="h-5 w-5 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-2">
                Clear Lead Status System
              </h3>
              <p className="text-sm text-muted-foreground">
                Five simple statuses: New, Contacted, In Progress, Closed, or Dropped. No ambiguity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Follow-up System */}
      <section className="container py-16 border-t">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-4 text-foreground">
            Follow-up System
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Every lead is categorized by follow-up urgency. Daily review takes under 5 minutes.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg border-l-4 border-l-overdue bg-overdue/5">
              <AlertCircle className="h-5 w-5 text-overdue flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Overdue</h3>
                <p className="text-sm text-muted-foreground">
                  Leads past their follow-up date. Handle these first.
                </p>
              </div>
              <span className="text-sm font-medium text-overdue">Urgent</span>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg border-l-4 border-l-primary bg-primary/5">
              <Clock className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Today</h3>
                <p className="text-sm text-muted-foreground">
                  Follow-ups scheduled for today. Your daily focus.
                </p>
              </div>
              <span className="text-sm font-medium text-primary">Active</span>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg border-l-4 border-l-muted bg-muted/30">
              <ArrowUpRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Upcoming</h3>
                <p className="text-sm text-muted-foreground">
                  Future follow-ups. Review when time permits.
                </p>
              </div>
              <span className="text-sm font-medium text-muted-foreground">Scheduled</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="container py-16 border-t">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-12 text-foreground">
            Dashboard Preview
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-overdue/5 border border-overdue/20 text-center">
              <div className="text-3xl font-bold text-overdue mb-1">2</div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
              <div className="text-3xl font-bold text-primary mb-1">3</div>
              <div className="text-sm text-muted-foreground">Today</div>
            </div>
            <div className="p-4 rounded-xl bg-warning/5 border border-warning/20 text-center">
              <div className="text-3xl font-bold text-warning mb-1">5</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="p-4 rounded-xl bg-muted border text-center">
              <div className="text-3xl font-bold text-muted-foreground mb-1">8</div>
              <div className="text-sm text-muted-foreground">Closed</div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link to="/dashboard">
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-8">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground">
            © Venturemond · Personal Lead Management System
          </p>
        </div>
      </footer>
    </div>
  );
}