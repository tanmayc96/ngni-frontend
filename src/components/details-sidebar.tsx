
"use client";

import { useState } from "react";
import type { ROIRegion } from "@/types/roi";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ExternalLink, DollarSign, CalendarDays, FileText, Info, Users, LineChart, HardHat, Shield, Leaf, Scale, CreditCard, TrendingUp, MessageSquareText } from "lucide-react";
import { ReportDialog } from "./report-dialog";
import { Chatbot } from "./chatbot";

interface DetailsSidebarProps {
  region: ROIRegion | null;
  isOpen: boolean;
  onClose: () => void;
}

const AccordionSection: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <AccordionItem value={title}>
    <AccordionTrigger className="font-headline text-base text-foreground hover:no-underline">
      <div className="flex items-center">
        <Icon className="w-4 h-4 mr-3 shrink-0 text-primary" />
        {title}
      </div>
    </AccordionTrigger>
    <AccordionContent className="text-sm text-muted-foreground space-y-4 pt-2 pl-2 border-l-2 border-primary/20 ml-2">
      {children}
    </AccordionContent>
  </AccordionItem>
);

const SectionContent: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <div>
    <h4 className="font-semibold text-foreground mb-1">{title}</h4>
    <p className="leading-relaxed text-xs">{content}</p>
  </div>
);

const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; }> = ({ title, value, icon: Icon }) => (
  <Card className="flex-1">
    <CardHeader className="p-3">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center">
            <Icon className="w-4 h-4 mr-2"/>
            {title}
        </CardTitle>
    </CardHeader>
    <CardContent className="p-3 pt-0">
        <p className="text-lg font-bold text-foreground">
            {value}
        </p>
    </CardContent>
  </Card>
)

export function DetailsSidebar({ region, isOpen, onClose }: DetailsSidebarProps) {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-[90vw] max-w-xl sm:max-w-xl p-0 flex flex-col bg-card shadow-xl">
          {region ? (
            <>
              <SheetHeader className="p-6 pb-4">
                <SheetTitle className="font-headline text-2xl text-primary flex items-center">
                  <Info className="w-6 h-6 mr-3 text-primary" />
                  {region.name}
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  Detailed Investment Opportunity Analysis
                </SheetDescription>
              </SheetHeader>
              <Separator />
              <ScrollArea className="flex-grow">
                <div className="space-y-6 p-6">
                  {/* Key Metrics */}
                  <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center">
                            <LineChart className="w-5 h-5 mr-3 shrink-0 text-primary" />
                            Key Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="grid grid-cols-2 gap-4">
                            <MetricCard title="Projected ROI" value={`${region.roiPercentage.toFixed(1)}%`} icon={TrendingUp} />
                            <MetricCard title="Timeline" value={region.timeline} icon={CalendarDays} />
                            <MetricCard title="Projected Revenue" value={region.projectedRevenue} icon={Scale} />
                            <MetricCard title="Projected Cost" value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(region.projectedCost)} icon={CreditCard} />
                             <MetricCard title="Net Profit" value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(region.netProfit)} icon={DollarSign} />
                       </div>
                    </CardContent>
                  </Card>

                  {/* Accordion for details */}
                  <Accordion type="multiple" className="w-full" defaultValue={['revenue-demand']}>
                    <AccordionSection title="Revenue & Demand" icon={Users}>
                        <SectionContent title="Market Size & Density" content={region.marketSizeAndDensity} />
                        <Separator />
                        <SectionContent title="Demographic Profile" content={region.demographicProfile} />
                        <Separator />
                        <SectionContent title="Projected Demand" content={region.projectedDemand} />
                    </AccordionSection>

                    <AccordionSection title="Cost & Feasibility" icon={HardHat}>
                        <SectionContent title="Deployment Complexity" content={region.deploymentComplexity} />
                        <Separator />
                        <SectionContent title="Labor & Resource Costs" content={region.laborAndResourceCosts} />
                    </AccordionSection>
                    
                    <AccordionSection title="Competitive Landscape" icon={Shield}>
                        <SectionContent title="Incumbent Provider Analysis" content={region.incumbentAnalysis} />
                        <Separator />
                        <SectionContent title="Competitive Pricing" content={region.competitivePricing} />
                    </AccordionSection>

                    <AccordionSection title="Regulatory & ESG" icon={Leaf}>
                        <SectionContent title="Permitting & Regulation" content={region.permittingAndRegulation} />
                        <Separator />
                        <SectionContent title="ESG Impact Score" content={region.esgImpactScore} />
                    </AccordionSection>
                  </Accordion>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-headline flex items-center">
                          <MessageSquareText className="w-5 h-5 mr-3 shrink-0 text-primary" />
                          Chat with Analyst
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                       <Chatbot regionData={region} />
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
              
              <div className="p-6 mt-auto border-t bg-background/50">
                <Button
                  onClick={() => setIsReportDialogOpen(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  aria-label={`Open deep research report for ${region.name}`}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Research Report
                </Button>
              </div>
            </>
          ) : (
            <div className="p-6 flex items-center justify-center h-full">
              <p className="text-muted-foreground">Select a region on the map to view details.</p>
            </div>
          )}
          <SheetClose onClick={onClose} className="sr-only">Close</SheetClose>
        </SheetContent>
      </Sheet>

      {region && (
        <ReportDialog
          isOpen={isReportDialogOpen}
          onClose={() => setIsReportDialogOpen(false)}
          reportMarkdown={region.detailed_report}
          title={region.name}
        />
      )}
    </>
  );
}
